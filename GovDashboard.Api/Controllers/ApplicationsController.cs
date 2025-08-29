using GovDashboard.Api.Models;
using GovDashboard.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GovDashboard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ApplicationsController : ControllerBase
{
    private readonly ApplicationsService _applicationsService;
    private readonly GenAiService _genAiService;

    public ApplicationsController(ApplicationsService applicationsService, GenAiService genAiService)
    {
        _applicationsService = applicationsService;
        _genAiService = genAiService;
    }

    [HttpGet]
    public async Task<List<Application>> Get() =>
        await _applicationsService.GetAsync();

    [HttpPost]
    public async Task<IActionResult> Post(Application newApplication)
    {
      
        newApplication.SubmissionDate = DateTime.UtcNow;
        await _applicationsService.CreateAsync(newApplication);

       
        try
        {
            if (!string.IsNullOrWhiteSpace(newApplication.Details) && newApplication.Id != null)
            {
                var triageResult = await _genAiService.TriageApplicationAsync(newApplication.Details);
                await _applicationsService.UpdateTriageDataAsync(newApplication.Id, triageResult.Sentiment, triageResult.Urgency);
                
              
                newApplication.Sentiment = triageResult.Sentiment;
                newApplication.Urgency = triageResult.Urgency;
            }
        }
        catch(Exception ex)
        {
        
            Console.WriteLine($"Could not perform triage for application {newApplication.Id}: {ex.Message}");
        }

     
        return CreatedAtAction(nameof(Get), new { id = newApplication.Id }, newApplication);
    }

    [HttpPost("search")]
    public async Task<ActionResult<List<Application>>> Search([FromBody] SearchRequest request)
    {
        var availableDistricts = await _applicationsService.GetUniqueDistrictsAsync();
        var availableSchemes = await _applicationsService.GetUniqueSchemesAsync();

        var mongoQuery = await _genAiService.GetMongoDbQueryAsync(request.Query, availableDistricts, availableSchemes);

        if (string.IsNullOrWhiteSpace(mongoQuery) || mongoQuery == "{}")
        {
            return Ok(new List<Application>());
        }
        var applications = await _applicationsService.SearchAsync(mongoQuery);
        return Ok(applications);
    }
    
    [HttpPost("generate-report")]
    public async Task<ActionResult<ReportResponse>> GenerateReport([FromBody] ReportRequest request)
    {
        var applications = await _applicationsService.GetApplicationsByDateRangeAsync(request.StartDate, request.EndDate);

        if (applications == null || applications.Count == 0)
        {
            return Ok(new ReportResponse { Report = "### No Application Data Found\n\nThere were no applications submitted during the selected period. Please select a different date range." });
        }
        
        var reportText = await _genAiService.GenerateReportAsync(applications, request.StartDate, request.EndDate);

        return Ok(new ReportResponse { Report = reportText });
    }

    [HttpGet("anomalies")]
    public async Task<ActionResult<List<Anomaly>>> ScanForAnomalies()
    {
        var applications = await _applicationsService.GetRecentAsync(100);

        if (applications == null || !applications.Any())
        {
            return Ok(new List<Anomaly>());
        }

        var anomalies = await _genAiService.ScanForAnomaliesAsync(applications);
        return Ok(anomalies);
    }
}