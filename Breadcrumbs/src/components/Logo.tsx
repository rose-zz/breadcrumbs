import Image from "next/image";
import Link from "next/link";

const Logo = () => {
  return (
    <div>
      <Link href="/" className="link">
        <div className="d-flex align-items-center">
          <Image
            src="/bread.png"
            alt="Bread icon"
            width={160}
            height={160}
            style={{ objectFit: "contain" }}
            priority
          />
          <div className="ms-3">
            <h1
              className="mb-0"
              style={{ fontSize: "2.5rem", fontWeight: "bold" }}
            >
              breadcrumbs
            </h1>
            <p
              className="mb-0"
              style={{ fontSize: "1.2rem", fontWeight: "bold" }}
            >
              notes and hunts
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Logo;
