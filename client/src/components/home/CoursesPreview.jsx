import { Link } from 'react-router-dom';
import { featuredCourses, formatCoursePrice } from '../../data/featuredCourses';
import './CoursesPreview.css';

export default function CoursesPreview() {
  return (
    <section className="courses-preview" aria-labelledby="courses-preview-title">
      <div className="container">
        <div className="section-heading courses-preview__heading">
          <div>
            <p className="eyebrow">Explore Bastly</p>
            <h2 id="courses-preview-title">Find the course that fits you.</h2>
          </div>

          <div className="courses-preview__heading-copy">
            <p>
              Learn with instructors who know the syllabus, the exam, and how to make
              difficult ideas click.
            </p>
            <Link className="text-link" to="/courses">
              View all courses <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="courses-preview__grid">
          {featuredCourses.map((course) => (
            <article className="course-card" key={course.id}>
              <div className="course-card__media">
                <img
                  src={course.image}
                  alt={`${course.doctor}, instructor for ${course.title}`}
                  loading="lazy"
                  decoding="async"
                />

                <div className="course-card__tags" aria-label="Course categories">
                  {course.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>

              <div className="course-card__body">
                <div>
                  <p className="course-card__subtitle">{course.subtitle}</p>
                  <h3>{course.title}</h3>
                  <p className="course-card__doctor">
                    with{' '}
                    <Link to={`/doctors/${course.doctorSlug}`}>
                      {course.doctor}
                    </Link>
                  </p>
                </div>

                <div className="course-card__footer">
                  <div>
                    <span className="course-card__price-label">Course price</span>
                    <strong>{formatCoursePrice(course.price, course.currency)}</strong>
                  </div>

                  <Link
                    className="course-card__button"
                    to={`/courses/${course.id}`}
                    aria-label={`View ${course.title}`}
                  >
                    View course
                    <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="courses-preview__price-note">
          Course prices shown during development are temporary and can be updated from
          Bastly Admin before launch.
        </p>
      </div>
    </section>
  );
}
