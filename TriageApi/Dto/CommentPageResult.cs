using TriageApi.Models;

namespace TriageApi.Dto;

public class CommentPageResult
{
    public List<Comment> Comments { get; set; } = new();

    public int TotalCount { get; set; }

    public bool HasMore { get; set; }
}