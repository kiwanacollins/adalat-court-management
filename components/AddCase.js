import AddCaseForm from './ui/AddCaseForm';

function AddCase() {
  return (
    <section className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-[#0f172a] px-6 py-5">
            <h1 className="text-white text-xl font-bold">Register New Case</h1>
            <p className="text-slate-400 text-sm mt-1">Lwengo Grade I Magistrate&apos;s Court</p>
          </div>
          <div className="px-6 py-8">
            <AddCaseForm />
          </div>
        </div>
      </div>
    </section>
  );
}

export default AddCase;
