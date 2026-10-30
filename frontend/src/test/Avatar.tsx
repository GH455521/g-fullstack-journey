interface avatarProps {
  src?: string;
  size?: number;
  name: string;
}

export function Avatar({ src, size = 48, name }: avatarProps) {
  const style = { width: size, height: size, borderRadius: "50%" };
  return src ? (
    <img src={src} style={style} alt={name} />
  ) : (
    <div
      style={{
        ...style,
        background: "#888",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {name[0].toUpperCase()}
    </div>
  );
}
