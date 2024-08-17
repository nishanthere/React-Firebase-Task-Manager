import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircleIcon, TrashIcon, PlayIcon } from '@heroicons/react/24/outline';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "to-do",
  });
  const [filter, setFilter] = useState("all");

  const updateTaskStatus = (task) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    if (task.status === 'completed' || task.status === 'in progress') {
      return task;
    } else if (dueDate < today) {
      return { ...task, status: 'overdue' };
    } else {
      return { ...task, status: 'to-do' };
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      const querySnapshot = await getDocs(collection(db, 'tasks'));
      const fetchedTasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      const updatedTasks = fetchedTasks.map(updateTaskStatus);
      setTasks(updatedTasks);

      updatedTasks.forEach(async (task) => {
        if (task.status !== fetchedTasks.find(t => t.id === task.id).status) {
          await updateDoc(doc(db, 'tasks', task.id), { status: task.status });
        }
      });
    };
    fetchTasks();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (newTask.title && newTask.dueDate) {
      const taskWithUpdatedStatus = updateTaskStatus(newTask);
      const docRef = await addDoc(collection(db, 'tasks'), taskWithUpdatedStatus);
      setTasks([...tasks, { id: docRef.id, ...taskWithUpdatedStatus }]);
      setNewTask({
        title: "",
        description: "",
        dueDate: "",
        status: "to-do",
      });
    }
  };

  const handleSetInProgress = async (id) => {
    await updateDoc(doc(db, 'tasks', id), { status: 'in progress' });
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status: 'in progress' } : task
    ));
  };

  const handleMarkComplete = async (id) => {
    await updateDoc(doc(db, 'tasks', id), { status: 'completed' });
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status: 'completed' } : task
    ));
  };

  const handleDeleteTask = async (id) => {
    await deleteDoc(doc(db, 'tasks', id));
    setTasks(tasks.filter(task => task.id !== id));
  };

  const filteredTasks = useMemo(() => {
    if (filter === "all") {
      return tasks;
    } else {
      return tasks.filter((task) => task.status === filter);
    }
  }, [tasks, filter]);

  return (
    <div className="container mx-auto p-4">
      <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 mb-4">
        <h1 className="text-3xl font-bold">Task Manager</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card text-card-foreground rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Add New Task</h2>
          <form onSubmit={handleAddTask}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="title">
                Task Title
              </label>
              <input
                className="w-full p-2 border border-input rounded-md bg-background"
                id="title"
                type="text"
                placeholder="Enter task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="description">
                Task Description
              </label>
              <textarea
                className="w-full p-2 border border-input rounded-md bg-background"
                id="description"
                placeholder="Enter task description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="dueDate">
                Due Date
              </label>
              <input
                className="w-full p-2 border border-input rounded-md bg-background"
                id="dueDate"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
            </div>
            <button
              className="w-full border border-primary text-primary font-bold py-2 px-4 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
              type="submit"
            >
              Add Task
            </button>
          </form>
        </div>

        <div className="bg-card text-card-foreground rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Task Filter</h2>
          <div className="flex flex-col space-y-2">
            {["all", "to-do", "in progress", "overdue", "completed"].map((filterOption) => (
              <button
                key={filterOption}
                className={`py-2 px-4 rounded-md border ${
                  filter === filterOption 
                    ? "border-primary text-primary" 
                    : "border-secondary text-secondary-foreground hover:border-primary hover:text-primary"
                } transition-colors`}
                onClick={() => setFilter(filterOption)}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-card text-card-foreground rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Task List</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2 text-left w-1/5">Title</th>
                <th className="px-4 py-2 text-left w-2/5">Description</th>
                <th className="px-4 py-2 text-left w-1/5">Due Date</th>
                <th className="px-4 py-2 text-left w-1/10">Status</th>
                <th className="px-4 py-2 text-left w-1/10">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id} className="border-b border-border">
                  <td className="px-4 py-2">{task.title}</td>
                  <td className="px-4 py-2">
                    <div className="max-h-20 overflow-y-auto">
                      {task.description}
                    </div>
                  </td>
                  <td className="px-4 py-2">{task.dueDate}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      task.status === "to-do" ? "bg-yellow-200 text-yellow-800" :
                      task.status === "in progress" ? "bg-blue-200 text-blue-800" :
                      task.status === "overdue" ? "bg-red-200 text-red-800" :
                      task.status === "completed" ? "bg-green-200 text-green-800" :
                      "bg-gray-200 text-gray-800"
                    }`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex space-x-2">
                      {task.status === "to-do" && (
                        <button
                          className="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white p-1 rounded transition-colors"
                          onClick={() => handleSetInProgress(task.id)}
                        >
                          <PlayIcon className="h-5 w-5" />
                        </button>
                      )}
                      {task.status !== "completed" && (
                        <button
                          className="border border-green-500 text-green-500 hover:bg-green-500 hover:text-white p-1 rounded transition-colors"
                          onClick={() => handleMarkComplete(task.id)}
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white p-1 rounded transition-colors"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TaskManager;
