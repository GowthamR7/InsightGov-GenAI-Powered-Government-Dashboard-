using GovDashboard.Api.Models;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Globalization;

namespace GovDashboard.Api.Services;

public class ApplicationsService
{
    private readonly IMongoCollection<Application> _applicationsCollection;

    public ApplicationsService(IOptions<MongoDBSettings> mongoDBSettings)
    {
        var mongoClient = new MongoClient(mongoDBSettings.Value.ConnectionString);
        var mongoDatabase = mongoClient.GetDatabase(mongoDBSettings.Value.DatabaseName);
        _applicationsCollection = mongoDatabase.GetCollection<Application>("Applications");
    }

    public async Task<List<Application>> GetAsync() =>
        await _applicationsCollection.Find(_ => true)
                                     .SortByDescending(app => app.SubmissionDate)
                                     .ToListAsync();

    public async Task CreateAsync(Application newApplication) =>
        await _applicationsCollection.InsertOneAsync(newApplication);

    public async Task<List<Application>> SearchAsync(string mongoQuery)
    {
        var filter = BsonDocument.Parse(mongoQuery);
        return await _applicationsCollection.Find(filter)
                                            .SortByDescending(app => app.SubmissionDate)
                                            .ToListAsync();
    }
    
    public async Task<List<Application>> GetApplicationsByDateRangeAsync(string startDate, string endDate)
    {
        var startDateTime = DateTime.Parse(startDate + "T00:00:00Z", CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal);
        var endDateTime = DateTime.Parse(endDate + "T23:59:59Z", CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal);
        
        var filter = Builders<Application>.Filter.Gte(app => app.SubmissionDate, startDateTime) &
                     Builders<Application>.Filter.Lte(app => app.SubmissionDate, endDateTime);

        return await _applicationsCollection.Find(filter)
                                            .SortByDescending(app => app.SubmissionDate)
                                            .ToListAsync();
    }
    
    public async Task<List<Application>> GetRecentAsync(int limit = 100) =>
        await _applicationsCollection.Find(_ => true)
                                     .SortByDescending(app => app.SubmissionDate)
                                     .Limit(limit)
                                     .ToListAsync();

    public async Task<List<string>> GetUniqueDistrictsAsync() =>
        await _applicationsCollection.DistinctAsync<string>("district", new BsonDocument()).Result.ToListAsync();

    public async Task<List<string>> GetUniqueSchemesAsync() =>
        await _applicationsCollection.DistinctAsync<string>("schemeAppliedFor", new BsonDocument()).Result.ToListAsync();

    public async Task UpdateTriageDataAsync(string id, string sentiment, string urgency)
{
    var filter = Builders<Application>.Filter.Eq(app => app.Id, id);
    var update = Builders<Application>.Update
        .Set(app => app.Sentiment, sentiment)
        .Set(app => app.Urgency, urgency);

    await _applicationsCollection.UpdateOneAsync(filter, update);
}
}