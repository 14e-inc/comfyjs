#!/usr/bin/sh

DEV_AUTHOR_SCRIPT_HOME="./scripts/devauthor"

for i in $(ls $DEV_AUTHOR_SCRIPT_HOME/*.sh); do
    echo "would have run . " $DEV_AUTHOR_SCRIPT_HOME/$i
done