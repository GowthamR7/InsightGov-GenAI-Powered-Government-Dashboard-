using GenerativeAI;
using GovDashboard.Api.Models;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace GovDashboard.Api.Services;

public class GenAiService
{
    private readonly GenerativeModel _model;

    public GenAiService(IConfiguration configuration)
    {
        var apiKey = configuration["Gemini:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException("Gemini API key is not configured. Please set the 'Gemini:ApiKey' in your user secrets or configuration.");
        }
        
        _model = new GenerativeModel(model: "gemini-1.5-flash-latest", apiKey: apiKey);
    }

    public async Task<string> GetMongoDbQueryAsync(string naturalLanguageQuery, List<string> districts, List<string> schemes)
    {
        var districtList = string.Join(", ", districts);
        var schemeList = string.Join(", ", schemes);

        var prompt = $@"
            You are an expert at converting natural language into MongoDB queries. Your goal is to interpret the user's intent, not just match keywords.

            **Available Data Context:**
            - The available districts are: [{districtList}]
            - The available schemes are: [{schemeList}]

            **Instructions:**
            1.  **Interpret Intent:** Understand what the user is asking for conceptually.
            2.  **Use Context for Regions:** If the user mentions a region (e.g., 'south tamilnadu', 'chennai and coimbatore'), use the district list to identify the relevant districts and create a query using the `$in` operator. For example, 'south tamilnadu' should map to districts like 'Tirunelveli', 'Kanyakumari', 'Madurai', etc.
            3.  **Use Context for Scheme Types:** If the user mentions a category of scheme (e.g., 'loan schemes', 'grants', 'scholarships'), use the scheme list to find all schemes containing that word and use the `$in` operator with case-insensitive regex for each.
            4.  **Handle Specific Names:** For specific names like 'Sundar', use a case-insensitive regex search on the 'fullName' field.
            5.  **Combine Criteria:** Always combine multiple criteria using the `$and` operator.
            6.  **Fallback:** If the query is too vague or cannot be mapped to the context, return an empty JSON object {{}}.
            7.  **Output:** Return ONLY the MongoDB query JSON, with no extra text.

            **User Query:** ""{naturalLanguageQuery}""
            **MongoDB Query JSON:**
        ";

        try
        {
            var response = await _model.GenerateContentAsync(prompt);
            var cleanedJson = Regex.Match(response.Text, @"\{.*\}", RegexOptions.Singleline).Value;
            return string.IsNullOrWhiteSpace(cleanedJson) ? "{}" : cleanedJson;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error generating intelligent search query: {ex.Message}");
            return "{}";
        }
    }

    public async Task<string> GenerateReportAsync(List<Application> applications, string startDate, string endDate)
    {
        var jsonData = JsonSerializer.Serialize(applications, new JsonSerializerOptions { WriteIndented = true });

        var prompt = $@"
            You are a professional data analyst for a government agency. Your task is to generate a summary report based on a provided JSON dataset of public scheme applications.
            The report is for the period: {startDate} to {endDate}.

            **Report Requirements:**
            1.  **Title:** 'Application Summary Report'.
            2.  **Reporting Period:** State the date range clearly.
            3.  **Overall Summary:** A short paragraph summarizing the total number of applications and the most important findings.
            4.  **Scheme Analysis:** A section titled '## Most Popular Schemes' with a bulleted list of the top 3-5 schemes by application count.
            5.  **District Analysis:** A section titled '## Top Districts by Application Volume' with a bulleted list of the top 3-5 districts.
            6.  **Concluding Insights:** A brief, data-driven conclusion or observation.

            **Formatting:** You must use Markdown (headings, bold text, bullets). Be professional and formal in your tone.

            **Dataset:**
            {jsonData}

            Generate the report now.
        ";

        try
        {
            var response = await _model.GenerateContentAsync(prompt);
            return response.Text;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error generating report: {ex.Message}");
            return "Error: Could not generate the report due to an internal issue.";
        }
    }

    public async Task<List<Anomaly>> ScanForAnomaliesAsync(List<Application> applications)
    {
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var jsonData = JsonSerializer.Serialize(applications, options);

        var prompt = $@"
            You are a meticulous fraud and error detection analyst for a government agency.
            Your task is to analyze the following JSON dataset of public scheme applications and identify any suspicious or anomalous entries based on a strict set of rules.

            **Analysis Criteria (Apply these rules in order):**
            1.  **Clear Duplicates:** Flag all but the first occurrence of applications that appear to be duplicates. A duplicate is defined as having the same 'fullName' and the same 'schemeAppliedFor'. The reason should be 'Potential duplicate entry.'
            2.  **Vague Details:** Flag any application where the 'details' text is suspiciously short (fewer than 10 words), overly generic (e.g., 'need money', 'for my expenses'), or appears to be placeholder text (e.g., 'testing', 'sample details'). The reason should clearly state that the details are vague.
            3.  **Logical Outliers:** Flag applications that seem logically inconsistent. For example, an applicant from 'Lucknow' applying for a 'Tamil Nadu Fishermen's Subsidy' scheme. The reason should specify the logical conflict.

            **Output Requirements:**
            - You MUST return your findings as a well-formed JSON array of objects.
            - Each object in the array must have two properties: 'applicationId' (string) and 'reason' (string).
            - The 'applicationId' must exactly match the 'id' field from the input data.
            - The 'reason' should be a concise, one-sentence explanation based on the criteria above.
            - If no anomalies are found, you MUST return an empty JSON array: [].
            - Do not include any text, explanations, or markdown formatting outside of the JSON array itself.

            **Dataset:**
            {jsonData}

            Analyze the data and return the JSON array of anomalies now.
        ";
        
        try
        {
            var response = await _model.GenerateContentAsync(prompt);
            var jsonResponse = Regex.Match(response.Text, @"\[.*\]", RegexOptions.Singleline).Value;

            if (string.IsNullOrWhiteSpace(jsonResponse))
            {
                return new List<Anomaly>();
            }

            var anomalies = JsonSerializer.Deserialize<List<Anomaly>>(jsonResponse, options);
            return anomalies ?? new List<Anomaly>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error during anomaly detection: {ex.Message}");
            return new List<Anomaly>();
        }
    }
    
    public async Task<TriageResult> TriageApplicationAsync(string details)
    {
        var prompt = $@"
            You are a highly efficient government triage officer. Your job is to analyze the sentiment and urgency of an application based on its details.
            
            **Instructions:**
            - Analyze the following text for emotional sentiment and the urgency of the request.
            - You MUST return a single, well-formed JSON object.
            - The JSON object must have two keys: 'sentiment' and 'urgency'.
            - Possible values for 'sentiment' are: 'Positive', 'Neutral', 'Negative'.
            - Possible values for 'urgency' are: 'Low', 'Medium', 'High'.
            - Do not include any text or markdown outside of the JSON object.

            **Application Details:** ""{details}""

            **JSON Output:**
        ";

        try
        {
            var response = await _model.GenerateContentAsync(prompt);
            var cleanedJson = Regex.Match(response.Text, @"\{.*\}", RegexOptions.Singleline).Value;
            
            if (string.IsNullOrWhiteSpace(cleanedJson))
            {
                return new TriageResult();
            }

            return JsonSerializer.Deserialize<TriageResult>(cleanedJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) 
                   ?? new TriageResult();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error during triage analysis: {ex.Message}");
            return new TriageResult();
        }
    }
}




public class TriageResult
{
    public string Sentiment { get; set; } = "Neutral";
    public string Urgency { get; set; } = "Low";
}

public class Anomaly
{
    public string applicationId { get; set; } = "";
    public string reason { get; set; } = "";
}

public class SearchRequest
{
    public string Query { get; set; } = "";
}

public class ReportRequest
{
    public string StartDate { get; set; } = "";
    public string EndDate { get; set; } = "";
}

public class ReportResponse
{
    public string Report { get; set; } = "";
}