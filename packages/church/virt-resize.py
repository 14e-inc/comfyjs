#!/usr/bin/env python3
import argparse
import logging
import os
import shutil
import subprocess
import sys
from datetime import datetime
import json

# ---------------------------------------------------------
# Logging Configuration
# ---------------------------------------------------------
def setup_logging():
    """Sets up robust logging to both console and a log file."""
    log_filename = f"vm_resize_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
    
    logger = logging.getLogger("VMResizer")
    logger.setLevel(logging.INFO)
    
    log_format = logging.Formatter(
        '[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s', 
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    file_handler = logging.FileHandler(log_filename)
    file_handler.setFormatter(log_format)
    logger.addHandler(file_handler)
    
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(log_format)
    logger.addHandler(console_handler)
    
    return logger

# ---------------------------------------------------------
# Command Runner Helper
# ---------------------------------------------------------
def run_command(cmd, logger, dry_run=False, stdout_file=None):
    """Executes a system command with robust logging and error handling."""
    cmd_str = " ".join(cmd)
    
    if dry_run:
        logger.info(f"#[DRY-RUN] Would execute: {cmd_str}")
        if stdout_file:
            logger.info(f"#[DRY-RUN] Would redirect output to: {stdout_file}")
        return True

    logger.info(f"Executing command: {cmd_str}")
    try:
        if stdout_file:
            with open(stdout_file, 'w') as f:
                result = subprocess.run(cmd, stdout=f, stderr=subprocess.PIPE, text=True, check=True)
        else:
            # text=True (or universal_newlines) captures stdout/stderr as strings
            result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
            if result.stdout:
                logger.info(f"Command output:\n{result.stdout.strip()}")
                
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Command failed with exit code {e.returncode}")
        logger.error(f"Command stderr:\n{e.stderr.strip()}")
        raise RuntimeError(f"External command failed: {cmd_str}")
    except Exception as e:
        logger.error(f"Failed to initiate command: {e}")
        raise

# ---------------------------------------------------------
# Command Runner Helper
# ---------------------------------------------------------
def store_command_result(cmd, logger, dry_run=False, stdout_file=None):
    """Executes a system command with robust logging and error handling."""
    cmd_str = " ".join(cmd)
    
    if dry_run:
        logger.info(f"#[DRY-RUN] Would execute: {cmd_str}")
        if stdout_file:
            logger.info(f"#[DRY-RUN] Would redirect output to: {stdout_file}")
        return True

    logger.info(f"Executing command: {cmd_str}")
    try:
        if stdout_file:
            with open(stdout_file, 'w') as f:
                result = subprocess.run(cmd, stdout=f, stderr=subprocess.PIPE, capture_output=True, text=True, check=True)
        else:
            # text=True (or universal_newlines) captures stdout/stderr as strings
            result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, capture_output=True, text=True, check=True)
            if result.stdout:
                logger.info(f"Command output:\n{result.stdout.strip()}")
                
        return result
    except subprocess.CalledProcessError as e:
        logger.error(f"Command failed with exit code {e.returncode}")
        logger.error(f"Command stderr:\n{e.stderr.strip()}")
        raise RuntimeError(f"External command failed: {cmd_str}")
    except Exception as e:
        logger.error(f"Failed to initiate command: {e}")
        raise


# ---------------------------------------------------------
# Main Logic
# ---------------------------------------------------------
def main():
    logger = setup_logging()
    logger.info("Initializing VM Resizer script...")

    # Define arguments
    parser = argparse.ArgumentParser(
        description="Safely resize a libvirt VM."
    )
    parser.add_argument(
        '--source', 
        required=True, 
        help="The name of the source/original Virtual Machine."
    )
    parser.add_argument(
        '--add-gb', 
        required=True, 
        help="The Number of Gigs to add to the VM."
    )
    parser.add_argument(
        '--dry-run', 
        action='store_true', 
        help="Show commands that would be executed without modifying the system."
    )

    try:
        args = parser.parse_args()
        
        src_vm = args.source.strip()
        add_gb = int(args.add_gb.strip())
        dry_run = args.dry_run

        # Validation Guardrails
        if not src_vm or not add_gb:
            raise ValueError("Source VM name and additional GB cannot be empty.")
        
        if add_gb <= 0:
            raise ValueError("Additional GB must be a positive integer.")

        if dry_run:
            logger.info("!!! DRY-RUN MODE ENABLED — No changes will be written to disk !!!")

        logger.info(f"Configuration: Source='{src_vm}' -> Additional GB='{add_gb}'")

        vm_img_path = store_command_result(["virsh", "domblklist", src_vm, "--details"], logger, dry_run=dry_run)
        if vm_img_path:
            print("VM Image Path:\n", json.dumps(vm_img_path.stdout))

        return True

        # Define paths based on your requirements
        images_dir = "/var/lib/libvirt/images"
        src_qcow2_path = os.path.join(images_dir, f"{src_vm}.qcow2")

        # ---------------------------------------------------------
        # Step 1: Generate XML Definition via virt-clone
        # ---------------------------------------------------------
        logger.info("Step 1/3: Generating destination XML configuration via virt-clone...")
        clone_cmd = [
            "virt-clone",
            "--original", src_vm,
            "--name", dst_vm,
            "--file", dst_qcow2_path,
            "--print-xml"
        ]
        run_command(clone_cmd, logger, dry_run=dry_run, stdout_file=dst_xml_file)

        # ---------------------------------------------------------
        # Step 2: Copy the QCOW2 Virtual Disk
        # ---------------------------------------------------------
        logger.info("Step 2/3: Copying virtual disk image...")
        # Note: 'cp --progress' output can flood logs. We invoke standard 'cp' via subprocess.
        # Alternatively, for a non-dry-run, python's native shutil could be used, 
        # but sticking to 'cp' preserves consistency with your exact tool chain.
        copy_cmd = ["cp", src_qcow2_path, dst_qcow2_path]
        run_command(copy_cmd, logger, dry_run=dry_run)

        # ---------------------------------------------------------
        # Step 3: Run virt-sysprep on the new disk
        # ---------------------------------------------------------
        logger.info("Step 3/3: Running virt-sysprep to reset VM identity...")
        sysprep_cmd = ["virt-sysprep", "-a", dst_qcow2_path]
        run_command(sysprep_cmd, logger, dry_run=dry_run)

        logger.info("All steps completed successfully.")

    except ValueError as ve:
        logger.error(f"Validation Error: {ve}")
        sys.exit(1)
    except RuntimeError as re:
        logger.critical(f"Execution Stopped: {re}")
        sys.exit(1)
    except Exception as e:
        logger.critical(f"An unexpected fatal error occurred: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()