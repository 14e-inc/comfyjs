#!/usr/bin/env python3
import argparse
import logging
import os
import shutil
import subprocess
import sys
from datetime import datetime

# ---------------------------------------------------------
# Logging Configuration
# ---------------------------------------------------------
def setup_logging():
    """Sets up robust logging to both console and a log file."""
    log_filename = f"vm_clone_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
    
    logger = logging.getLogger("VMCloner")
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
        logger.info("#[DRY-RUN] Would execute: {cmd_str}")
        if stdout_file:
            logger.info("#[DRY-RUN] Would redirect output to: {stdout_file}")
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
# Main Logic
# ---------------------------------------------------------
def main():
    logger = setup_logging()
    logger.info("Initializing VM Deployment script...")

    # Define arguments
    parser = argparse.ArgumentParser(
        description="Safely clone, copy storage, and sysprep a libvirt VM."
    )
    parser.add_argument(
        '--source', 
        required=True, 
        help="The name of the source/original Virtual Machine."
    )
    parser.add_argument(
        '--destination', 
        required=True, 
        help="The name of the destination/new Virtual Machine."
    )
    parser.add_argument(
        '--dry-run', 
        action='store_true', 
        help="Show commands that would be executed without modifying the system."
    )

    try:
        args = parser.parse_args()
        
        src_vm = args.source.strip()
        dst_vm = args.destination.strip()
        dry_run = args.dry_run

        # Validation Guardrails
        if not src_vm or not dst_vm:
            raise ValueError("Source and Destination VM names cannot be empty.")
        
        if src_vm == dst_vm:
            raise ValueError("Source and Destination VM names must be different.")

        if dry_run:
            logger.info("!!! DRY-RUN MODE ENABLED — No changes will be written to disk !!!")

        logger.info(f"Configuration: Source='{src_vm}' -> Destination='{dst_vm}'")

        # Define paths based on your requirements
        images_dir = "/var/lib/libvirt/images"
        dst_qcow2_path = os.path.join(images_dir, f"{dst_vm}.qcow2")
        src_qcow2_path = os.path.join(images_dir, f"{src_vm}.qcow2")
        dst_xml_file = f"{dst_vm}.xml"

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
        print("#[COMMAND] virt-clone command to generate XML:")
        print(json.dumps(clone_cmd))
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