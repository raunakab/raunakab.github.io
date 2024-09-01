const content = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        {content.title}
      </h1>
      <p className="mb-4">{content.description}</p>
    </section>
  );
}
