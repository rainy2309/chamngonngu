import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/about", destination: "/ve-du-an", permanent: false },
      { source: "/community", destination: "/cong-dong", permanent: false },
      { source: "/dictionary", destination: "/tu-dien", permanent: false },
      { source: "/login", destination: "/dang-nhap", permanent: false },
      { source: "/register", destination: "/dang-ky", permanent: false },
      { source: "/profile", destination: "/ho-so", permanent: false },
      { source: "/vocab", destination: "/khoa-hoc/tu-vung", permanent: false },
      { source: "/lessons", destination: "/khoa-hoc", permanent: false },
      { source: "/lessons/:path*", destination: "/khoa-hoc", permanent: false },
      { source: "/flashcards", destination: "/khoa-hoc/luyen-tap", permanent: false },
      { source: "/quiz", destination: "/khoa-hoc/luyen-tap", permanent: false },
      { source: "/hoc-ky-hieu", destination: "/khoa-hoc/bang-chu-cai", permanent: false },
      { source: "/giao-tiep", destination: "/cong-dong", permanent: false },
    ];
  },
};

export default nextConfig;
