#!/usr/bin/sh

DEV_AUTHOR_SCRIPT_HOME="./scripts/devauthor"

echo "Devinstall initiated."
echo "..."
echo "..."
echo "..."


for i in $(ls $DEV_AUTHOR_SCRIPT_HOME/*.sh); do
    # echo "would have run . " $i
    echo "Installing $i..."
    . $i
done