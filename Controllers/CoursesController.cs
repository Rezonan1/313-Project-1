using Microsoft.AspNetCore.Mvc;
using StudentRegistrationAPI_.Models;

namespace StudentRegistrationAPI_.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CoursesController : ControllerBase
    {
        private static List<Course> courses = new List<Course>();
        private static int nextCourseId = 1;

        [HttpGet]
        public IActionResult GetCourses()
        {
            var result = courses.Select(c => new
            {
                c.Id,
                c.Code,
                c.Title,
                EnrolledCount = StudentsController.Students.Count(s =>
                    string.Equals(s.Course, c.Title, StringComparison.OrdinalIgnoreCase))
            });

            return Ok(result);
        }

        [HttpPost]
        public IActionResult AddCourse(Course course)
        {
            course.Id = nextCourseId++;
            courses.Add(course);
            return Ok(course);
        }

        [HttpGet("{id}/students")]
        public IActionResult GetCourseStudents(int id)
        {
            var course = courses.Find(c => c.Id == id);
            if (course == null) return NotFound();

            var enrolled = StudentsController.Students
                .Where(s => string.Equals(s.Course, course.Title, StringComparison.OrdinalIgnoreCase))
                .ToList();

            return Ok(new
            {
                Course = course,
                Students = enrolled
            });
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteCourse(int id)
        {
            var course = courses.Find(c => c.Id == id);
            if (course == null) return NotFound();

            courses.Remove(course);
            return NoContent();
        }
    }
}