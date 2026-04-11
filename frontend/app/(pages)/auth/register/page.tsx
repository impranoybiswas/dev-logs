"use client";

import React from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Select,
  DatePicker,
  Row,
  Col,
} from "antd";
import { message } from "@/lib/antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { ImageUpload } from "@/components/ImageUpload";
import { motion } from "framer-motion";

interface User {
  name: string;
  email: string;
  password: string;
  gender: string;
  birthDate?: Date | string;
  profilePhoto: string;
}

interface ErrorResponse {
  message: string;
}

const { Title, Text } = Typography;
const { Option } = Select;

export default function RegisterPage() {
  const router = useRouter();
  const [form] = Form.useForm();

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/profile");
    }
  }, [router]);

  const registerMutation = useMutation({
    mutationFn: async (values: User) => {
      // Format date for backend if provided
      if (values.birthDate && typeof values.birthDate !== "string") {
        values.birthDate = (
          values.birthDate as { toISOString: () => string }
        ).toISOString();
      }
      const response = await api.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        values,
      );
      return response.data;
    },
    onSuccess: () => {
      message.success("Registration successful! Please login.");
      router.push("/auth/login");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      message.error(error.response?.data?.message || "Registration failed");
    },
  });

  const onFinish = (values: User) => {
    registerMutation.mutate(values);
  };

  return (
    <div className="page-container">
      <section className="px-5 flex flex-col items-center justify-center p-6 selection:bg-primary/20 h-dvh">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-4xl"
        >
          <Card className="glass premium-card p-4 md:p-8 border-none shadow-2xl! shadow-primary/10">
            <div className="text-center mb-12">
              <Title
                level={2}
                className="m-0! text-4xl! font-black tracking-tighter text-foreground"
              >
                Create Account
              </Title>
              <Text className="text-muted-foreground font-medium text-lg">
                Join the elite developer community
              </Text>
            </div>

            <Form
              form={form}
              name="register"
              onFinish={onFinish}
              layout="vertical"
              size="large"
              className="space-y-2"
            >
              <Row gutter={32}>
                <Col xs={24} md={14}>
                  <Form.Item
                    name="name"
                    rules={[
                      { required: true, message: "Please input your Name!" },
                    ]}
                    className="mb-4"
                  >
                    <Input
                      prefix={
                        <UserOutlined className="text-muted-foreground mr-2" />
                      }
                      placeholder="Full Name"
                      className="h-14! rounded-2xl! border-foreground/5! hover:border-primary! bg-foreground/5!"
                    />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: "Please input your Email!" },
                      { type: "email", message: "Please enter a valid email!" },
                    ]}
                    className="mb-4"
                  >
                    <Input
                      prefix={
                        <MailOutlined className="text-muted-foreground mr-2" />
                      }
                      placeholder="Email Address"
                      className="h-14! rounded-2xl! border-foreground/5! hover:border-primary! bg-foreground/5!"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "Please input your Password!",
                      },
                      {
                        min: 6,
                        message: "Password must be at least 6 characters!",
                      },
                    ]}
                    className="mb-4"
                  >
                    <Input.Password
                      prefix={
                        <LockOutlined className="text-muted-foreground mr-2" />
                      }
                      placeholder="Password"
                      className="h-14! rounded-2xl! border-foreground/5! hover:border-primary! bg-foreground/5!"
                    />
                  </Form.Item>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Form.Item name="gender" className="mb-4">
                      <Select
                        placeholder="Gender"
                        className="h-14! rounded-2xl! border-foreground/5! hover:border-primary! bg-foreground/5!"
                      >
                        <Option value="male">Male</Option>
                        <Option value="female">Female</Option>
                        <Option value="other">Other</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item name="birthDate" className="mb-4">
                      <DatePicker
                        className="w-full h-14! rounded-2xl! border-foreground/5! hover:border-primary! bg-foreground/5!"
                        placeholder="Birth Date"
                      />
                    </Form.Item>
                  </div>
                </Col>

                <Col
                  xs={24}
                  md={10}
                  className="flex flex-col justify-center items-center"
                >
                  <Form.Item
                    name="profilePhoto"
                    className="w-full text-center mb-0"
                  >
                    <div className="flex flex-col items-center">
                      <Text className="mb-4 block text-muted-foreground font-bold uppercase tracking-widest text-xs">
                        Profile Image
                      </Text>
                      <ImageUpload />
                    </div>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item className="mt-8 mb-6">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full h-14! rounded-2xl! bg-primary! hover:bg-primary-hover! border-none font-bold! text-lg! tracking-tight! shadow-xl! shadow-primary/20"
                  loading={registerMutation.isPending}
                >
                  Create Account
                </Button>
              </Form.Item>

              <div className="text-center text-muted-foreground font-medium">
                Already have an account?{" "}
                <a
                  href="/auth/login"
                  className="text-primary hover:text-primary-hover transition-colors font-bold ml-1"
                >
                  Sign in instead
                </a>
              </div>
            </Form>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
