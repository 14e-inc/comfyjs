pushme() {
    # Check if a commit message was provided
    if [ -z "$1" ]; then
        echo "Error: Please provide a commit message."
        echo "Usage: pushme \"your commit message\""
        return 1
    fi

    # Stage all changes
    git add .

    # Commit with the provided message
    git commit -m "$1"

    # Push to origin on the current branch
    git push origin HEAD
}