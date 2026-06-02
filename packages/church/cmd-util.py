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
def setup_logging(cmd_name="cmd_util"):
    """Sets up robust logging to both console and a log file."""
    log_filename = f"{cmd_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
    
    logger = logging.getLogger(cmd_name)
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

if __name__ == "__main__":
    main()