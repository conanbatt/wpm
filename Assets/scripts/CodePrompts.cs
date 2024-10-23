[System.Serializable]
public class CodePrompts
{
    public string name;
    public string[] lines;
}

[System.Serializable]
public class CodePromptList
{
    public CodePrompts[] prompts;
}
