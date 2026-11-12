using Microsoft.AspNetCore.Mvc;
using StudentRegistrationAPI_.Models;

namespace StudentRegistrationAPI_.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentsController : ControllerBase
    {
        public static List<Student> Students = new List<Student>();
        private static int nextId = 1;

        [HttpGet]
        public IActionResult GetStudents()
        {
            return Ok(Students);
        }

        [HttpGet("{id}")]
        public IActionResult GetStudent(int id)
        {
            var student = Students.Find(s => s.Id == id);
            if (student == null) return NotFound();
            return Ok(student);
        }

        [HttpPost]
        public IActionResult AddStudent(Student student)
        {
            student.Id = nextId++;
            Students.Add(student);
            return Ok(student);
        }

        [HttpGet("search/{name}")]
        public IActionResult SearchStudents(string name)
        {
            var results = Students.FindAll(s =>
                s.Name.Contains(name, StringComparison.OrdinalIgnoreCase));
            return Ok(results);
        }

        [HttpPut("{id}")]
        public IActionResult UpdateStudent(int id, Student updatedStudent)
        {
            var student = Students.Find(s => s.Id == id);
            if (student == null) return NotFound();

            student.Name = updatedStudent.Name;
            student.Course = updatedStudent.Course;
            return Ok(student);
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteStudent(int id)
        {
            var student = Students.Find(s => s.Id == id);
            if (student == null) return NotFound();

            Students.Remove(student);
            return NoContent();
        }
    }
}