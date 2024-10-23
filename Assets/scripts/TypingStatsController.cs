using UnityEngine;
using TMPro;

public class TypingStatsController : MonoBehaviour
{
    public TypingGameController typingGameController;
    public TextMeshProUGUI wpmText;
    public TextMeshProUGUI accuracyText;
    public TextMeshProUGUI locText;
    public TextMeshProUGUI rankText;
    public TextMeshProUGUI timerText;

    private float startTime;
    private bool isGameActive = true;

    [SerializeField]
    private float timeLimit = 60f;
    [SerializeField]
    private float[] thresholds = new float[] { 40f, 90f, 10f };

    private enum ThresholdName { WPM, Accuracy, LOC }

    void Start()
    {
        startTime = Time.time;
    }

    void Update()
    {
        if (isGameActive)
        {
            float elapsedTime = Time.time - startTime;
            float remainingTime = timeLimit - elapsedTime;

            if (remainingTime <= 0f || !typingGameController.isGameActive)
            {
                remainingTime = 0f;
                isGameActive = false;
                CalculateAndDisplayMetrics();
            }

            timerText.text = $"Time: {remainingTime:F2}";
        }
    }

    public void CalculateAndDisplayMetrics()
    {
        int correctCharacters = typingGameController.playerInputText.text.Length;
        int totalCharacters = typingGameController.backgroundText.text.Length;

        float wpm = (correctCharacters / 5f) / ((Time.time - startTime) / 60f);
        float accuracy = (correctCharacters / (float)totalCharacters) * 100;

        int correctLines = typingGameController.playerInputText.text.Split(new[] { '\n' }, System.StringSplitOptions.RemoveEmptyEntries).Length;
        float loc = correctLines / ((Time.time - startTime) / 60f);

        wpmText.text = $"WPM: {wpm:F2}";
        accuracyText.text = $"Accuracy: {accuracy:F2}%";
        locText.text = $"LOC: {loc:F2}";

        EvaluateRank(wpm, accuracy, loc);
    }

    private void EvaluateRank(float wpm, float accuracy, float loc)
    {
        string rank = "Junior";
        if (accuracy >= thresholds[(int)ThresholdName.Accuracy] && wpm >= thresholds[(int)ThresholdName.WPM] && loc >= thresholds[(int)ThresholdName.LOC])
        {
            rank = "Senior";
        }
        else if (accuracy >= 80 && wpm >= 30 && loc >= 5)
        {
            rank = "Semi-Senior";
        }
        rankText.text = $"Rank: {rank}";
    }
}
