using UnityEngine;
using UnityEngine.UI;
public class TypingStatsController : MonoBehaviour
{
    public GameObject Canvascontainer;
    public GameObject Canvascontainer2;
    public TypingGameController typingGameController;
    public Text wpmText;
    public Text accuracyText;
    public Text locText;
    public Text rankText;
    public Text timerText;

    private float startTime;
    private bool isGameActive = true;
    private int completedCharactersCount = 0;

    [SerializeField]
    private float timeLimit = 60f;

    private void Start()
    {
        startTime = Time.time;
    }

    private void Update()
    {
        if (isGameActive)
        {
            float elapsedTime = Time.time - startTime;
            float remainingTime = timeLimit - elapsedTime;

            if (remainingTime <= 0f || !typingGameController.IsGameActive())
            {
                remainingTime = 0f;
                isGameActive = false;
                EndGame();
                Canvascontainer2.SetActive(true);
                Canvascontainer.SetActive(false);
                CalculateAndDisplayMetrics();
            }

            timerText.text = $"Time: {remainingTime:F2}";
        }
    }

    public void AddCompletedCharacters(int count)
    {
        completedCharactersCount += count; 
    }

    public void CalculateAndDisplayMetrics()
    {
        int totalCorrectCharacters = typingGameController.correctChars;
        int totalIncorrectCharacters = typingGameController.incorrectChars;

        int totalCharacters = completedCharactersCount + totalCorrectCharacters + totalIncorrectCharacters;

        float wpm = (totalCorrectCharacters / 5f) / ((Time.time - startTime) / 60f);
        float accuracy = (totalCharacters > 0) ? (totalCorrectCharacters / (float)totalCharacters) * 100 : 0;

        wpmText.text = $"WPM: {wpm:F2}";
        accuracyText.text = $"Accuracy: {accuracy:F2}%";
        locText.text = $"LOC: {typingGameController.completedLines.Count}";

        Debug.Log($"Correct Characters: {totalCorrectCharacters}");
        Debug.Log($"Incorrect Characters: {totalIncorrectCharacters}");
        Debug.Log($"Total Characters: {totalCharacters}");

        EvaluateRank(wpm, accuracy);
    }

    private void EvaluateRank(float wpm, float accuracy)
    {
        string rank = "Junior";
        if (accuracy >= 90 && wpm >= 40)
        {
            rank = "Senior";
        }
        else if (accuracy >= 80 && wpm >= 30)
        {
            rank = "Semi-Senior";
        }
        rankText.text = $"Rank: {rank}";
    }

    public bool IsGameActive()
    {
        return isGameActive;
    }

    public void EndGame()
    {
        isGameActive = false;
        CalculateAndDisplayMetrics();
    }
}
