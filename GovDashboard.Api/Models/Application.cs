// In GovDashboard.Api/Models/Application.cs
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;

namespace GovDashboard.Api.Models
{
    public class Application
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("fullName")]
        [JsonPropertyName("fullName")]
        public string FullName { get; set; } = null!;

        [BsonElement("district")]
        [JsonPropertyName("district")]
        public string District { get; set; } = null!;

        [BsonElement("schemeAppliedFor")]
        [JsonPropertyName("schemeAppliedFor")]
        public string SchemeAppliedFor { get; set; } = null!;

        [BsonElement("submissionDate")]
        [JsonPropertyName("submissionDate")]
        public DateTime SubmissionDate { get; set; }

        [BsonElement("details")]
        [JsonPropertyName("details")]
        public string Details { get; set; } = null!;

     
        [BsonElement("sentiment")]
        [JsonPropertyName("sentiment")]
        [BsonIgnoreIfNull]
        public string? Sentiment { get; set; }

        [BsonElement("urgency")]
        [JsonPropertyName("urgency")]
        [BsonIgnoreIfNull]
        public string? Urgency { get; set; }
    }
}