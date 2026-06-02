vm_ip_addr() {
    # banking on a coincidence here. This should actually check for any word characters
    for i in $(virsh list | cut -d ' ' -f 6 | grep -E '[a-zA-Z0-9]{2,}'); do
        virsh domifaddr $i
    done

}