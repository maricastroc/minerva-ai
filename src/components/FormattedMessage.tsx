export function FormattedMessage({ content }: { content: string }) {
  const lines = content.split('\n');

  return (
    <div>
      {lines.map((line, index) => (
        <div key={index}>
          {line}
          {index < lines.length - 1 && <br />}
        </div>
      ))}
    </div>
  );
}
