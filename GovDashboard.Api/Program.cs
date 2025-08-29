using GovDashboard.Api.Models;
using GovDashboard.Api.Services;

var builder = WebApplication.CreateBuilder(args);


var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy =>
                      {
                          policy.WithOrigins("*") 
                                .AllowAnyHeader()
                                .AllowAnyMethod();
                      });
});


builder.Services.Configure<MongoDBSettings>(builder.Configuration.GetSection("MongoDBSettings"));


builder.Services.AddSingleton<ApplicationsService>();
builder.Services.AddSingleton<GenAiService>();



builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}


app.UseCors(MyAllowSpecificOrigins);

app.UseAuthorization();

app.MapControllers();

app.Run();
