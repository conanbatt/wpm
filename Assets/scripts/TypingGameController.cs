using UnityEngine;
using TMPro;
using System.Collections;
using System.IO;

public class TypingGameController : MonoBehaviour
{
    public TextMeshProUGUI backgroundText;
    public TextMeshProUGUI playerInputText;
    public TextMeshProUGUI rivalText;
    public TypingStatsController typingStatsController;
    public TextMeshProUGUI completedLineText;
    public bool isGameActive = true;
    public float rivalTypingSpeed = 0.5f;
    public float gameDuration = 30f;
    private string[] codeLines;
    private int currentLineIndex = 0;
    private int playerInputIndex = 0;
    private int rivalTypingIndex = 0;
    private float totalElapsedTime = 0f;
    private int correctChars = 0;
    private int incorrectChars = 0;

    void Start()
    {
        LoadCodeFromJson();
        InitializeGame();
        StartCoroutine(SimulateRivalTyping());
    }

    void Update()
    {
        if (isGameActive)
        {
            HandlePlayerInput();
            totalElapsedTime += Time.deltaTime;
            if (totalElapsedTime >= gameDuration)
            {
                EndGame();
            }
        }
    }

    private void LoadCodeFromJson()
    {
        string filePath = Path.Combine(Application.streamingAssetsPath, "CodePrompts.json");
        if (File.Exists(filePath))
        {
            string jsonContent = File.ReadAllText(filePath);
            CodePromptList promptList = JsonUtility.FromJson<CodePromptList>(jsonContent);
            if (promptList != null && promptList.prompts.Length > 0)
            {
                var randomPrompt = promptList.prompts[Random.Range(0, promptList.prompts.Length)];
                codeLines = randomPrompt.lines;
            }
        }
        else
        {
            Debug.LogError("JSON file not found in: " + filePath);
        }
    }

    private void InitializeGame()
    {
        if (codeLines != null && codeLines.Length > 0)
        {
            backgroundText.text = codeLines[currentLineIndex];
            playerInputText.text = string.Empty;
            completedLineText.text = string.Empty;
        }
    }

    private void HandlePlayerInput()
    {
        if (Input.anyKeyDown && playerInputIndex < codeLines[currentLineIndex].Length)
        {
            char typedChar = Input.inputString.Length > 0 ? Input.inputString[0] : '\0';
            if (typedChar == codeLines[currentLineIndex][playerInputIndex])
            {
                playerInputText.text += codeLines[currentLineIndex][playerInputIndex];
                playerInputIndex++;
                correctChars++;
                if (playerInputIndex >= codeLines[currentLineIndex].Length)
                {
                    NextLine();
                }
            }
            else if (Input.GetKeyDown(KeyCode.Backspace) && playerInputIndex > 0)
            {
                playerInputIndex--;
                playerInputText.text = playerInputText.text.Substring(0, playerInputIndex);
            }
            else if (typedChar != '\0')
            {
                incorrectChars++;
            }
        }
        if (Input.GetKeyDown(KeyCode.Return) && playerInputIndex < codeLines[currentLineIndex].Length && codeLines[currentLineIndex][playerInputIndex] == '\n')
        {
            playerInputText.text += "\n";
            playerInputIndex++;
        }
    }

    private IEnumerator SimulateRivalTyping()
    {
        while (rivalTypingIndex < codeLines[currentLineIndex].Length && isGameActive)
        {
            if (rivalTypingIndex < playerInputIndex)
            {
                rivalTypingIndex++;
                yield return null;
            }
            else
            {
                rivalText.text = codeLines[currentLineIndex].Substring(0, rivalTypingIndex + 1);
                rivalTypingIndex++;
                yield return new WaitForSeconds(rivalTypingSpeed);
            }
        }
    }

    private void NextLine()
    {
        completedLineText.text = codeLines[currentLineIndex];
        if (currentLineIndex < codeLines.Length - 1)
        {
            currentLineIndex++;
            playerInputIndex = 0;
            rivalTypingIndex = 0;
            backgroundText.text = codeLines[currentLineIndex];
            playerInputText.text = string.Empty;
            rivalText.text = string.Empty;
            StartCoroutine(SimulateRivalTyping());
        }
        else
        {
            EndGame();
        }
    }

    private void EndGame()
    {
        isGameActive = false;
        StopAllCoroutines();
        typingStatsController.CalculateAndDisplayMetrics();
        Debug.Log($"Correct: {correctChars}, Incorrect: {incorrectChars}");
    }
}
