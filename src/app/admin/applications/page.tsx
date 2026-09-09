import { prisma } from "@/lib/prisma";
import ApplicationStatusSelect from "./ApplicationStatusSelect";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
  const applications = await prisma.application.findMany({
    include: { course: true, intake: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Applications</h1>
      <p className="mt-1 text-sm text-white/50">
        Review student applications and update their status.
      </p>

      {applications.length === 0 ? (
        <p className="mt-8 text-white/50">No applications yet.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/50">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Intake</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Emails</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-t border-white/10 align-top">
                  <td className="px-4 py-3 font-mono text-xs text-white/60">
                    {app.applicationRef}
                  </td>
                  <td className="px-4 py-3">
                    <p>{app.fullName}</p>
                    <p className="text-xs text-white/40">{app.phone}</p>
                    {app.email && <p className="text-xs text-white/40">{app.email}</p>}
                    {app.message && (
                      <p className="mt-1 max-w-xs text-xs text-white/50">{app.message}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">{app.course.title}</td>
                  <td className="px-4 py-3">{app.intake.name}</td>
                  <td className="px-4 py-3 text-xs text-white/50">
                    {app.createdAt.toISOString().slice(0, 10)}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <p className={app.adminEmailStatus === "SENT" ? "text-green-400" : "text-white/40"}>
                      Admin: {app.adminEmailStatus}
                    </p>
                    <p className={app.applicantEmailStatus === "SENT" ? "text-green-400" : "text-white/40"}>
                      Applicant: {app.applicantEmailStatus}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <ApplicationStatusSelect applicationId={app.id} currentStatus={app.status} />
                  </td>
                  <td className="px-4 py-3">
                    <DeleteButton
                      endpoint={`/api/admin/applications/${app.id}`}
                      confirmMessage={`Delete the application from ${app.fullName}? This cannot be undone.`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}