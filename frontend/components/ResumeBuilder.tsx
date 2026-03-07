"use client";

import { useState, useEffect } from "react";
import { Card, Button, Form, Input, Divider, Row, Col, Tabs } from "antd";
import { message } from "@/lib/antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  DownloadOutlined,
  UserOutlined,
  BookOutlined,
  RocketOutlined,
  ToolOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import api from "@/lib/api";
import { generatePDF } from "@/lib/generate-pdf";

const { TextArea } = Input;

interface Personal {
  name: string;
  email: string;
  phone: string;
  summary: string;
}

interface Experience {
  company: string;
  position: string;
  duration: string;
  description: string;
}

interface Project {
  title: string;
  description1: string;
  description2: string;
  description3: string;
  techStack: string;
}

interface Education {
  school: string;
  degree: string;
  year: string;
}

interface Skill {
  name: string;
}

export interface ResumeData {
  templateId?: string;
  personal: Personal;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: Skill[];
}

const PersonalForm = () => (
  <div className="space-y-4">
    <Row gutter={16}>
      <Col span={24}>
        <Form.Item
          name={["personal", "name"]}
          label="Full Name"
          rules={[{ required: true }]}
        >
          <Input placeholder="John Doe" />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name={["personal", "email"]}
          label="Email"
          rules={[{ type: "email" }]}
        >
          <Input placeholder="john@example.com" />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item name={["personal", "phone"]} label="Phone">
          <Input placeholder="+1 234 567 890" />
        </Form.Item>
      </Col>
      <Col span={24}>
        <Form.Item name={["personal", "summary"]} label="Professional Summary">
          <TextArea rows={4} placeholder="Brief summary of your career..." />
        </Form.Item>
      </Col>
    </Row>
  </div>
);

const EducationForm = () => (
  <Form.List name="education">
    {(fields, { add, remove }) => (
      <div className="space-y-4">
        {fields.map(({ key, name, ...restField }) => (
          <Card
            key={key}
            size="small"
            extra={
              <MinusCircleOutlined
                onClick={() => remove(name)}
                style={{ color: "#f5222d", cursor: "pointer" }}
              />
            }
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  {...restField}
                  name={[name, "school"]}
                  label="School/University"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Stanford University" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  {...restField}
                  name={[name, "degree"]}
                  label="Degree"
                >
                  <Input placeholder="B.Sc. Computer Science" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item {...restField} name={[name, "year"]} label="Year">
                  <Input placeholder="2020 - 2024" />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        ))}
        <Button
          type="dashed"
          onClick={() => add()}
          block
          icon={<PlusOutlined />}
        >
          Add Education
        </Button>
      </div>
    )}
  </Form.List>
);

const ExperienceForm = () => (
  <Form.List name="experience">
    {(fields, { add, remove }) => (
      <div className="space-y-4">
        {fields.map(({ key, name, ...restField }) => (
          <Card
            key={key}
            size="small"
            extra={
              <MinusCircleOutlined
                onClick={() => remove(name)}
                style={{ color: "#f5222d", cursor: "pointer" }}
              />
            }
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  {...restField}
                  name={[name, "company"]}
                  label="Company"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Google" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  {...restField}
                  name={[name, "position"]}
                  label="Position"
                >
                  <Input placeholder="Software Engineer" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  {...restField}
                  name={[name, "duration"]}
                  label="Duration"
                >
                  <Input placeholder="Jan 2022 - Present" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  {...restField}
                  name={[name, "description"]}
                  label="Description"
                >
                  <TextArea
                    rows={3}
                    placeholder="Key responsibilities and achievements..."
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        ))}
        <Button
          type="dashed"
          onClick={() => add()}
          block
          icon={<PlusOutlined />}
        >
          Add Experience
        </Button>
      </div>
    )}
  </Form.List>
);

const SkillsForm = () => (
  <Form.List name="skills">
    {(fields, { add, remove }) => (
      <div className="space-y-4">
        {fields.map(({ key, name, ...restField }) => (
          <div key={key} className="flex gap-2">
            <Form.Item
              {...restField}
              name={[name, "name"]}
              className="grow mb-0"
              rules={[{ required: true, message: "Skill name is required" }]}
            >
              <Input placeholder="Skill (e.g. React, Node.js)" />
            </Form.Item>
            <MinusCircleOutlined
              onClick={() => remove(name)}
              style={{ color: "#ef4444", cursor: "pointer", marginTop: "8px" }}
            />
          </div>
        ))}
        <Button
          type="dashed"
          onClick={() => add()}
          block
          icon={<PlusOutlined />}
        >
          Add Skill
        </Button>
      </div>
    )}
  </Form.List>
);

const ProjectsForm = () => (
  <Form.List name="projects">
    {(fields, { add, remove }) => (
      <div className="space-y-4">
        {fields.map(({ key, name, ...restField }) => (
          <Card
            key={key}
            size="small"
            extra={
              <MinusCircleOutlined
                onClick={() => remove(name)}
                style={{ color: "#f5222d", cursor: "pointer" }}
              />
            }
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  {...restField}
                  name={[name, "title"]}
                  label="Project Title"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Dev Logs - Professional Portfolio" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  {...restField}
                  name={[name, "techStack"]}
                  label="Tech Stack"
                >
                  <Input placeholder="Next.js, NestJS, Prisma, PostgreSQL" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  {...restField}
                  name={[name, "description1"]}
                  label="Detail 1"
                >
                  <Input placeholder="Description of a key feature or achievement..." />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  {...restField}
                  name={[name, "description2"]}
                  label="Detail 2"
                >
                  <Input placeholder="Description of another key feature..." />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  {...restField}
                  name={[name, "description3"]}
                  label="Detail 3"
                >
                  <Input placeholder="Description of a third key feature..." />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        ))}
        <Button
          type="dashed"
          onClick={() => add()}
          block
          icon={<PlusOutlined />}
        >
          Add Project
        </Button>
      </div>
    )}
  </Form.List>
);

export default function ResumeBuilder() {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData>({
    templateId: "modern",
    personal: { name: "", email: "", phone: "", summary: "" },
    education: [],
    experience: [],
    projects: [],
    skills: [],
  });

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await api.get("/resume");
        if (response.data) {
          const newData = {
            templateId: response.data.templateId || "modern",
            personal: {
              name: response.data.name || response.data.user?.name || "",
              email: response.data.email || response.data.user?.email || "",
              phone: response.data.phone || response.data.user?.phone || "",
              summary: response.data.summary || "",
            },
            education: response.data.education || [],
            experience: response.data.experience || [],
            projects:
              response.data.projects?.map(
                (p: {
                  title: string;
                  techStack?: string;
                  details?: string[];
                }) => ({
                  title: p.title,
                  techStack: p.techStack || "",
                  description1: p.details?.[0] || "",
                  description2: p.details?.[1] || "",
                  description3: p.details?.[2] || "",
                }),
              ) || [],
            skills: response.data.skills || [],
          };
          setResumeData(newData);
          form.setFieldsValue(newData);
        }
      } catch (error) {
        console.error("Failed to fetch resume:", error);
        // Optionally fetch basic user info if resume doesn't exist
        try {
          const userRes = await api.get("/users/profile");
          setResumeData((prev) => ({
            ...prev,
            personal: {
              ...prev.personal,
              name: userRes.data.name,
              email: userRes.data.email,
              phone: userRes.data.phone || "", // Handle if phone is missing in user profile
            },
          }));
        } catch (e) {
          console.error("Failed to fetch user profile", e);
        }
      }
    };
    fetchResume();
  }, [form]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const allValues = form.getFieldsValue();
      const dataToSave = {
        ...allValues,
        projects:
          allValues.projects?.map((p: Project) => ({
            title: p.title,
            techStack: p.techStack,
            details: [p.description1, p.description2, p.description3].filter(
              (d) => d,
            ),
          })) || [],
      };
      await api.put("/resume", dataToSave);
      message.success("Resume saved successfully!");
    } catch (error) {
      console.error("Failed to save resume:", error);
      message.error("Failed to save resume");
    } finally {
      setSaving(false);
    }
  };

  const handleValuesChange = (_: unknown, allValues: ResumeData) => {
    setResumeData(allValues);
  };

  const tabItems = [
    {
      key: "1",
      label: (
        <span>
          <UserOutlined />
          Personal
        </span>
      ),
      children: <PersonalForm />,
    },
    {
      key: "2",
      label: (
        <span>
          <BookOutlined />
          Education
        </span>
      ),
      children: <EducationForm />,
    },
    {
      key: "3",
      label: (
        <span>
          <RocketOutlined />
          Experience
        </span>
      ),
      children: <ExperienceForm />,
    },
    {
      key: "4",
      label: (
        <span>
          <RocketOutlined />
          Projects
        </span>
      ),
      children: <ProjectsForm />,
    },
    {
      key: "5",
      label: (
        <span>
          <ToolOutlined />
          Skills
        </span>
      ),
      children: <SkillsForm />,
    },
  ];

  const templateItems = [
    {
      id: "modern",
      name: "Modern",
      color: "#3b82f6",
      bg: "bg-blue-500/10",
      border: "border-blue-500/50",
    },
    {
      id: "classic",
      name: "Classic",
      color: "#ff006e",
      bg: "bg-pink-900/10",
      border: "border-pink-900/50",
    },
    {
      id: "minimalist",
      name: "Minimalist",
      color: "#10b981",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/50",
    },
    {
      id: "professional",
      name: "Professional",
      color: "#6366f1",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/50",
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-100px)]">
      {/* Editor Section */}
      <div className="flex-1 flex flex-col gap-10">
        {/* Template Selector Block */}
        <Card
          size="default"
          className="mb-10 border-none shadow-sm bg-transparent p-0!"
        >
          <div className="mb-3 flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Select Template
            </h3>
            <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
              Current: {resumeData.templateId?.toUpperCase() || "MODERN"}
            </span>
          </div>
          <Row gutter={[12, 12]}>
            {templateItems.map((t) => (
              <Col xs={12} sm={6} key={t.id}>
                <div
                  className={`cursor-pointer rounded-xl border-2 p-3 text-center transition-all duration-300 hover:shadow-md ${
                    resumeData.templateId === t.id
                      ? `${t.bg} ${t.border} scale-105 shadow-sm`
                      : "border-transparent bg-card hover:border-border/50"
                  }`}
                  onClick={() => {
                    form.setFieldsValue({ templateId: t.id });
                    setResumeData({ ...resumeData, templateId: t.id });
                  }}
                  style={{
                    color: resumeData.templateId === t.id ? t.color : "inherit",
                  }}
                >
                  <div className="text-xs font-bold uppercase tracking-tight">
                    {t.name}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Card>

        <Card
          title="Resume Editor"
          style={{
            maxWidth: "100%",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            height: "fit-content",
            maxHeight: "85vh",
            overflowY: "auto",
            position: "sticky",
            top: "6rem",
            zIndex: 1,
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onValuesChange={handleValuesChange}
            initialValues={resumeData}
          >
            <Tabs defaultActiveKey="1" items={tabItems} />
          </Form>
          <Divider />
          <div className="flex gap-2">
            <Button
              type="default"
              size="large"
              block
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={saving}
            >
              Save
            </Button>

            <Button
              type="primary"
              size="large"
              block
              icon={<DownloadOutlined />}
              onClick={() => {
                const allValues = form.getFieldsValue();
                generatePDF(allValues);
              }}
            >
              Export PDF
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
