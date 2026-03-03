"use client";

import React from "react";
import { Form, Input, Button, Card, Typography } from "antd";
import { message } from "@/lib/antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";

const { Title, Text } = Typography;

interface LogIn {
  email: string;
  password: string;
}

interface ErrorResponse {
  message: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/profile");
      // keep isChecking true so nothing renders while redirecting
    } else {
      setIsChecking(false);
    }
  }, [router]);

  const loginMutation = useMutation({
    mutationFn: async (values: LogIn) => {
      const response = await api.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        values,
      );
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.access_token);
      message.success("Login successful!");
      router.push("/profile");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      message.error(error.response?.data?.message || "Login failed");
    },
  });

  const onFinish = (values: LogIn) => {
    loginMutation.mutate(values);
  };

  // Prevent flashing the login form before the redirect fires
  if (isChecking) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <Title level={2}>Welcome Back</Title>
          <Text type="secondary">Login to your account</Text>
        </div>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your Email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your Password!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              loading={loginMutation.isPending}
            >
              Log in
            </Button>
          </Form.Item>

          <div className="text-center">
            Or <a href="/auth/register">register now!</a>
          </div>
        </Form>
      </Card>
    </div>
  );
}
