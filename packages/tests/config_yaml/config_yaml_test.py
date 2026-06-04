import yaml
import json
import os

def test_all():
    # print current working directory
    print("Current working directory:", os.getcwd())

    with open(f"{os.getcwd()}/packages/tests/config_yaml/test_config.yaml", "r") as f:
        config = yaml.safe_load(f)

        print(json.dumps(config, indent=2))
    
    assert config["vm_name"].startswith("zulia-warp")
    assert config["vm_image_path"].startswith("/var/lib/libvirt/images")
    assert config["disk_size_gb"] == 40
    assert config["cloud_init_script_path"].startswith("/opt/church/cloud-init")