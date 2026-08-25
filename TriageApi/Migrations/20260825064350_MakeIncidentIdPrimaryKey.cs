using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TriageApi.Migrations
{
    /// <inheritdoc />
    public partial class MakeIncidentIdPrimaryKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Tickets",
                table: "Tickets");

            migrationBuilder.DropIndex(
                name: "IX_Tickets_IncidentId",
                table: "Tickets");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Tickets",
                table: "Tickets",
                column: "IncidentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Comments_Tickets_IncidentId",
                table: "Comments",
                column: "IncidentId",
                principalTable: "Tickets",
                principalColumn: "IncidentId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Comments_Tickets_IncidentId",
                table: "Comments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Tickets",
                table: "Tickets");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Tickets",
                table: "Tickets",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_IncidentId",
                table: "Tickets",
                column: "IncidentId",
                unique: true);
        }
    }
}
