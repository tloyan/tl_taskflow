export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div>
      <div>Page: Workspace Settings</div>
      <div>Params: (slug: {slug})</div>
    </div>
  );
}
