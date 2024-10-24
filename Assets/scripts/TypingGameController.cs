using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using UnityEngine.Networking;
using System.IO;
using System.Collections.Generic;

public class TypingGameController : MonoBehaviour
{
    public Text backgroundText;
    public Text playerInputText;
    public Text rivalText;
    public TypingStatsController typingStatsController;
    public Text completedLineText;
    public Text nextLineText;
    public List<string> completedLines = new List<string>();
    public int maxCompletedLines = 8;
    public float rivalTypingSpeed = 0.5f;
    public bool isGameActive = true;
    public int correctChars = 0;
    public int incorrectChars = 0;

    private string[] codeLines;
    private int currentLineIndex = 0;
    private int playerInputIndex = 0;
    private int rivalTypingIndex = 0;
    private int completedCharactersCount = 0;

    void Start()
    {
        StartCoroutine(LoadCodeFromJson());
    }

    void Update()
    {
        if (typingStatsController.IsGameActive())
        {
            HandlePlayerInput();
        }
    }

    private IEnumerator LoadCodeFromJson()
    {
        string filePath = Path.Combine(Application.streamingAssetsPath, "CodePrompts.json");
        UnityWebRequest request = UnityWebRequest.Get(filePath);
        yield return request.SendWebRequest();

        if (request.result == UnityWebRequest.Result.Success)
        {
            string jsonContent = request.downloadHandler.text;
            CodePromptList promptList = JsonUtility.FromJson<CodePromptList>(jsonContent);
            if (promptList != null && promptList.prompts.Length > 0)
            {
                var randomPrompt = promptList.prompts[Random.Range(0, promptList.prompts.Length)];
                codeLines = randomPrompt.lines;
                InitializeGame();
            }
        }
    }

    private void InitializeGame()
    {
        if (codeLines != null && codeLines.Length > 0)
        {
            backgroundText.text = codeLines[currentLineIndex];
            playerInputText.text = string.Empty;
            completedLineText.text = string.Empty;
            nextLineText.text = (currentLineIndex + 1 < codeLines.Length) ? codeLines[currentLineIndex + 1] : string.Empty;
            StartCoroutine(SimulateRivalTyping());
        }
    }

    public bool IsGameActive()
    {
        return isGameActive;
    }

    private void HandlePlayerInput()
    {
        if (Input.anyKeyDown && playerInputIndex < codeLines[currentLineIndex].Length)
        {
            char typedChar = Input.inputString.Length > 0 ? Input.inputString[0] : '\0';

            if (typedChar == codeLines[currentLineIndex][playerInputIndex])
            {
                playerInputText.text = codeLines[currentLineIndex].Substring(0, playerInputIndex + 1) + "|";
                playerInputIndex++;
                correctChars++;

                if (playerInputIndex >= codeLines[currentLineIndex].Length)
                {
                    NextLine();
                }
            }
            else if (typedChar != '\0')
            {
                incorrectChars++;
                StartCoroutine(ShakeText());
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
        if (codeLines == null || rivalText == null)
        {
            yield break;
        }

        while (rivalTypingIndex < codeLines[currentLineIndex].Length && typingStatsController.IsGameActive())
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
        completedLines.Add(codeLines[currentLineIndex]);
        completedCharactersCount += codeLines[currentLineIndex].Length;

        if (completedLines.Count > maxCompletedLines)
        {
            completedLines.RemoveAt(0);
        }
        completedLineText.text = string.Join("\n", completedLines);

        if (currentLineIndex < codeLines.Length - 1)
        {
            currentLineIndex++;
            playerInputIndex = 0;
            rivalTypingIndex = 0;
            backgroundText.text = codeLines[currentLineIndex];
            playerInputText.text = string.Empty;
            rivalText.text = string.Empty;
            nextLineText.text = (currentLineIndex + 1 < codeLines.Length) ? codeLines[currentLineIndex + 1] : string.Empty;
            StartCoroutine(SimulateRivalTyping());
        }
        else
        {
            nextLineText.text = string.Empty;
            EndGame();
        }
    }

    private void EndGame()
    {
        typingStatsController.EndGame();
    }

    private IEnumerator ShakeText()
    {
        Vector3 originalPosition = playerInputText.transform.localPosition;
        Vector3 originalRivalPosition = rivalText.transform.localPosition;
        Vector3 originalBackgroundPosition = backgroundText.transform.localPosition;

        float shakeDuration = 0.2f;
        float shakeMagnitude = 10f;
        float elapsed = 0.0f;

        while (elapsed < shakeDuration)
        {
            float offsetX = Random.Range(-1f, 1f) * shakeMagnitude;
            float offsetY = Random.Range(-1f, 1f) * shakeMagnitude;

            playerInputText.transform.localPosition = new Vector3(originalPosition.x + offsetX, originalPosition.y + offsetY, originalPosition.z);
            rivalText.transform.localPosition = new Vector3(originalRivalPosition.x + offsetX, originalRivalPosition.y + offsetY, originalRivalPosition.z);
            backgroundText.transform.localPosition = new Vector3(originalBackgroundPosition.x + offsetX, originalBackgroundPosition.y + offsetY, originalBackgroundPosition.z);

            elapsed += Time.deltaTime;
            yield return null;
        }

        playerInputText.transform.localPosition = originalPosition;
        rivalText.transform.localPosition = originalRivalPosition;
        backgroundText.transform.localPosition = originalBackgroundPosition;
    }
}
