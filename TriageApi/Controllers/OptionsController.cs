using Microsoft.AspNetCore.Mvc;
using TriageApi.Models;

namespace TriageApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OptionsController : ControllerBase
{
    [HttpGet]
    public ActionResult GetOptions()
    {
        return Ok(new
        {
            categories = TicketOptions.Categories,
            severities = TicketOptions.Severities,
            statuses = TicketOptions.Statuses,
            assignedTeams = TicketOptions.AssignedTeams,
            rootCauseCategories = TicketOptions.RootCauseCategories
        });
    }
}