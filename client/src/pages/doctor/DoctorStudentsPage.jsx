import { useEffect, useState } from 'react';

import DoctorPageHeader from '../../components/doctor/DoctorPageHeader';
import { api } from '../../services/api';

export default function DoctorStudentsPage() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [courseId, setCourseId] = useState('');

  const load = async (selectedCourse = '') => {
    const { data } = await api.get('/doctor/students', {
      params: selectedCourse ? { courseId: selectedCourse } : {},
    });

    setCourses(data.courses || []);
    setEnrollments(data.enrollments || []);
  };

  useEffect(() => {
    load();
  }, []);

  const filter = async (value) => {
    setCourseId(value);
    await load(value);
  };

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <DoctorPageHeader
        title="My students"
        description="You only see students with active enrollments in courses assigned to your doctor profile."
        action={
          <select
            value={courseId}
            onChange={(event) => filter(event.target.value)}
            className="min-h-11 rounded-full border border-line bg-white px-4 text-sm font-bold text-bastly-navy outline-none"
          >
            <option value="">All my courses</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        }
      />

      <div className="overflow-x-auto rounded-[24px] border border-line bg-white shadow-soft">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead className="bg-surface text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-muted">
            <tr>
              <th className="px-5 py-3">Student</th>
              <th className="px-5 py-3">Course</th>
              <th className="px-5 py-3">Group</th>
              <th className="px-5 py-3">Access</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment) => (
              <tr key={enrollment._id} className="border-t border-line">
                <td className="px-5 py-4">
                  <p className="mb-0 font-heading text-sm font-bold text-bastly-navy">
                    {enrollment.student?.fullName}
                  </p>
                  <p className="mb-0 text-xs text-muted">
                    {enrollment.student?.email}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <p className="mb-0 text-sm font-bold text-bastly-navy">
                    {enrollment.course?.title}
                  </p>
                  <p className="mb-0 text-xs text-muted">
                    {enrollment.course?.level}
                  </p>
                </td>
                <td className="px-5 py-4 text-sm text-muted">
                  {enrollment.group?.name}
                </td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-[#eef8f1] px-2.5 py-1 text-[0.68rem] font-extrabold text-[#18764a]">
                    Active
                  </span>
                </td>
              </tr>
            ))}

            {enrollments.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="px-5 py-10 text-center text-sm text-muted"
                >
                  No active students in this view yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 mb-0 text-xs leading-6 text-muted">
        Attendance, quiz performance, and weekly tracking will be added on top of
        this same scoped student list in the assessment/tracking step.
      </p>
    </main>
  );
}
