const CourseForm = ({
  formData,
  handleChange,
  handleSubmit,
  handelFile,
  btnText,
}) => {
  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card p-8 rounded-2xl shadow-card space-y-4"
    >
      <h2 className="text-2xl font-bold text-primary text-center">
        {btnText}
      </h2>

      {[
        { name: "title", placeholder: "Course Title" },
        { name: "instructor", placeholder: "Instructor Name" },
        { name: "price", placeholder: "Price", type: "number" },
        { name: "duration", placeholder: "Duration" },
        { name: "category", placeholder: "Category" },
      ].map((field) => (
        <input
          key={field.name}
          type={field.type || "text"}
          name={field.name}
          placeholder={field.placeholder}
          value={formData[field.name]}
          onChange={handleChange}
          className="input-field"
          required
        />
      ))}

      <textarea
        name="description"
        placeholder="Course Description"
        value={formData.description}
        onChange={handleChange}
        rows="4"
        className="input-field"
        required
      ></textarea>

      <input
        type="file"
        multiple
        onChange={handelFile}
        className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-accent file:text-accent file:bg-transparent file:cursor-pointer hover:file:bg-accent hover:file:text-bgDark file:transition-all"
      />

      <button className="btn-primary w-full py-3 rounded-lg">
        {btnText}
      </button>
    </form>
  );
};

export default CourseForm;