
#!/usr/bin/sh

# These functions will be called on the provisioned VM's to set up the development environment.

decl(){
    if [ -z "$1" ]; then
        echo "Usage: decl <function_name>"
        return 1
    fi

    echo "Installing $1..."
}

update(){
    decl "System Upgrades"
    sudo apt update && sudo apt upgrade -y
}

python_install(){
    decl "Python Utilities"
    sudo apt install -y python3-venv 
    sudo python3 -m pip install --user pipx
}

dbg_install(){
    decl "Debugging Utilities"
    sudo apt install -y neofetch
}

net_install(){
    decl "Network Utilities"
    sudo apt install -y net-tools ufw nginx
}


main_install(){
    echo "Starting main installation process..."
    update
    python_install
    dbg_install
    net_install
}
