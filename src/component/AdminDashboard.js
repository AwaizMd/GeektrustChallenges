import React, { useEffect, useState } from "react";
import "antd/dist/antd.css";
import {Table,Input,InputNumber,Popconfirm,Form,Typography,Button} from "antd";
import axios from "../utils/ApiService";
import { EditFilled, DeleteFilled } from "@ant-design/icons";
import { GET_DATA_URL } from "../utils/config";
const { Search } = Input;


const originData = [];

//editable rows
const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === "number" ? <InputNumber /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};



const AdminDashboard = () => {
  const [form] = Form.useForm();
  let [data, setData] = useState(originData);
  const [editingKey, setEditingKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [selectedData, setSelectedData] = useState([]);



  data =
    data &&
    data.filter((item) => {
      return Object.keys(item).some((key) =>
        item[key].toLowerCase().includes(filter)
      );
    });

  //deleting row  
  const removeId = (id) => {
    data = data.filter((item) => {
      return item.id !== id;
    });
    setData(data);
  };

  //delete secleted rows
  const removeSelected = () => {
    const idArray = selectedData.map((e) => e.id);
    data = data.filter((item) => {
      return !idArray.includes(item.id);
    });
    setData(data);
    setSelectedData([]);
  };

  //fetching users data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let { data: dataList } = await axios.get(GET_DATA_URL);
        dataList = dataList.map((item) => {
          var temp = Object.assign({}, item);
          temp.key = item.id;
          return temp;
        });
        setData(dataList);
        setLoading(false);
      } catch (e) {
        setLoading(false);
        console.log(e);
      }
    };
    fetchData();
  }, []);
  const isEditing = (record) => record.key === editingKey;

  //editing user details
  const edit = (record) => {
    form.setFieldsValue({
      name: "",
      age: "",
      address: "",
      ...record,
    });
    setEditingKey(record.key);
  };

  //cancelling edited user details
  const cancel = () => {
    setEditingKey("");
  };

  //saving edited user details
  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setData(newData);
        setEditingKey("");
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey("");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  //columns 
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      width: "30%",
      editable: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      width: "50%",
      editable: true,
    },
    {
      title: "Role",
      dataIndex: "role",
      width: "30%",
      editable: true,
    },
    {
      title: "Action",
      dataIndex: "action",
      className: "action",
      width: "50%",
      render: (_, record) => {
        const editable = isEditing(record);
        return (
          <>
            
            {editable ? (  //saving and cancelling buttons
              <span>
                <a
                  href="/"
                  onClick={() => save(record.key)}
                  style={{
                    marginRight: 8,
                  }}
                >
                  Save
                </a>
                <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
                  <a href="/#">Cancel</a>
                </Popconfirm>
              </span>
            ) : (
              <Typography.Link
                disabled={editingKey !== ""}
                onClick={() => edit(record)}
              >
                <EditFilled />
              </Typography.Link>
            )}
            
              <Typography.Link
                disabled={editingKey !== ""} //deleting button
                onClick={() => removeId(record.id)}
              >
                <DeleteFilled style={{color:"red",marginLeft:"12px"}} />
              </Typography.Link>
            
          </>
        );
      },
    },
  ];

  
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  //select rows
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        "selectedRows: ",
        selectedRows
      );
      setSelectedData(selectedRows);
    },
  };

  //search bar function
  const onSearchChange = (e) => {
    setFilter(e.target.value);
  };
 


  return (
    <>
      <h1 style={{fontFamily:"sans-'Brush Script MT', cursive"}}>Admin Dashboard</h1>
      <Search
        placeholder="Search by name, email or role"
        onChange={onSearchChange}
        enterButton
        style={{marginBottom:"10px",padding:"2px"}}
      />
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          rowSelection={{
            ...rowSelection,
          }}
          bordered
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{
            onChange: cancel,
          }}
        />
      </Form>
      {selectedData.length > 0 && (
        <Button
          type="primary"
          danger
          className="delete-selected-btn"
          onClick={() => removeSelected()}
        >
          Delete Selected
        </Button>
      )}
    </>
  );
};

export default AdminDashboard;