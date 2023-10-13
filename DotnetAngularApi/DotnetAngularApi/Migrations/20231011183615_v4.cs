using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DotnetAngularApi.Migrations
{
    /// <inheritdoc />
    public partial class v4 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "userRole",
                table: "users");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "users",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "users");

            migrationBuilder.AddColumn<string>(
                name: "userRole",
                table: "users",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
