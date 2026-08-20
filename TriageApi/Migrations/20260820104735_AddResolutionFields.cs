using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TriageApi.Migrations
{
    /// <inheritdoc />
    public partial class AddResolutionFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RootCause",
                table: "Tickets",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RootCause",
                table: "Tickets");
        }
    }
}
