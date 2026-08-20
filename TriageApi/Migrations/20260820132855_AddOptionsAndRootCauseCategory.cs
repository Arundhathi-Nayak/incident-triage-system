using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TriageApi.Migrations
{
    /// <inheritdoc />
    public partial class AddOptionsAndRootCauseCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RootCauseCategory",
                table: "Tickets",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RootCauseCategory",
                table: "Tickets");
        }
    }
}
