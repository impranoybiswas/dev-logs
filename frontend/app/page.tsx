"use client";

import { Button, Typography, Space } from 'antd';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <Title level={1}>Dev Logs</Title>
      <Paragraph className="text-xl max-w-lg">
        A simple and powerful application to manage your developer logs and profile.
      </Paragraph>
      <Space size="large">
        <Link href="/auth/login" passHref>
          <Button type="primary" size="large">Login</Button>
        </Link>
        <Link href="/auth/register" passHref>
          <Button size="large">Register</Button>
        </Link>
      </Space>
    </div>
  );
}
