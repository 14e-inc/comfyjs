dev_install(){
    # require devinstall.sh to be present in the current directory
    if [ ! -f devinstall.sh ]; then
        echo "devinstall.sh not found in the current directory. Please run this script from the root of the project."
        return 1
    fi

    # source devinstall.sh to get access to its functions
    . ./devinstall.sh
}