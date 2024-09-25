import React, { useState, useEffect } from 'react';
import './App.css';

function TodoList({token}) {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');

  useEffect(async () => {

    // Fetch all to-do items
    fetch('https://your-api-id.execute-api.region.amazonaws.com/prod/todos', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + token,  // Use JWT token for Authorization
      },
    })
      .then((response) => response.json())
      .then((data) => setTodos(data.items))
      .catch((error) => console.error('Error fetching to-dos:', error));
  }, []);

  const addTodo = () => {
    const newTodo = { id: Date.now().toString(), task, completed: false };

    fetch('https://your-api-id.execute-api.region.amazonaws.com/prod/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,  // Use JWT token for Authorization
      },
      body: JSON.stringify(newTodo),
    })
      .then((response) => response.json())
      .then((data) => {
        setTodos([...todos, newTodo]);
        setTask('');
      })
      .catch((error) => console.error('Error adding to-do:', error));
  };

  const deleteTodo = (id) => {
    fetch('https://your-api-id.execute-api.region.amazonaws.com/prod/todos', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,  // Use JWT token for Authorization
      },
      body: JSON.stringify({ id }),
    })
      .then((response) => response.json())
      .then(() => {
        setTodos(todos.filter((todo) => todo.id !== id));
      })
      .catch((error) => console.error('Error deleting to-do:', error));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>To-Do List</h1>

        <input
          type="text"
          placeholder="Add a task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />
        <button onClick={addTodo}>Add To-Do</button>

        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>
              {todo.task} <button onClick={() => deleteTodo(todo.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default TodoList;
