#!/usr/bin/sh

# This function will be called to update the system.
# It looks repetitive, but it will be used to run from the repo_root, preventing the need to cd into the script directories.
dev_install(){
    # require devinstall.sh to be present in the current directory
    if [ ! -f devinstall.sh ]; then
        echo "devinstall.sh not found in the current directory. Please run this script from the root of the project."
        return 1
    fi

    # source devinstall.sh to get access to its functions
    . ./devinstall.sh
}