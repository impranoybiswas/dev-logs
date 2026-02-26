"use client";
import { generatePDF } from "@/lib/generate-pdf";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Divider, Form, Input, Select, Tabs } from "antd";



const PersonalForm = () => {
  return (
    <div>
      <Form.Item
        name={["personal", "name"]}
        label="Full Name"
        rules={[{ required: true, message: "Please input your name" }]}
      >
        <Input placeholder="John Doe" />
      </Form.Item>

      <Form.Item
        name={["personal", "email"]}
        label="Email"
        rules={[{ required: true, validator: (rule, value) => { if (!value) return Promise.reject(new Error("Please input your email")); if (!value.includes("@")) return Promise.reject(new Error("Please input a valid email")); return Promise.resolve(); } }]}
      >
        <Input placeholder="john@example.com" />
      </Form.Item>

      <Form.Item
        name={["personal", "phone"]}
        label="Phone"
        rules={[{ required: true, validator: (rule, value) => { if (!value) return Promise.reject(new Error("Please input your phone number")); if (!value.startsWith("01") && value.split(" ").length != 1) return Promise.reject(new Error("Please input a valid phone number")); if (value.length !== 11) return Promise.reject(new Error("Number must be 11 digits")); return Promise.resolve(); } }]} 
      >
        <Input placeholder="+1 234 567 890" variant="filled" size="large" />
      </Form.Item>

      <Form.Item
        name={["personal", "summary"]}
        label="Professional Summary"

      >
        <Input placeholder="Brief summary of your career..." />
      </Form.Item>
    </div>
  );
};

const SkillsForm = () => {
  return (
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
                style={{
                  color: "#ef4444",
                  cursor: "pointer",
                  marginTop: "8px",
                }}
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
};

export default function SimpleForm() {
  const [form] = Form.useForm();

  const handleValuesChange = (changedValues: any, allValues: any) => {
    console.log("Field that changed:", changedValues);
    console.log("Current state of all fields:", allValues);

    // Example: Trigger logic if a specific field changes
    if (changedValues.username) {
      console.log("User is typing a name...");
    }
  };

  const handleSubmit = (values: any) => {
    console.log("Form values:", values);
    generatePDF(values);
  };

  const tabItems = [
    { key: "1", label: <span>Personal</span>, children: <PersonalForm /> },
    { key: "2", label: <span>Skills</span>, children: <SkillsForm /> },
  ];

  return (
    <div className="w-md mx-auto">
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
        onFinish={handleSubmit}
      >
        <Tabs defaultActiveKey="1" items={tabItems} />
        <Button type="primary" size="large" block htmlType="submit">
          Export PDF
        </Button>
      </Form>
    </div>
  );
}
