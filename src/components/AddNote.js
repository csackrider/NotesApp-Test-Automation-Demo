import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NoteEditorFields from './NoteEditorFields';

const AddNote = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post('http://localhost:3004/notes', { title, description });
      navigate('/');
    } catch (error) {
      console.error('Error adding note: ', error);
    }
  };

  return (
    <div className="container">
      <h2>Add Note</h2>
      <form onSubmit={handleSubmit}>
        <NoteEditorFields
          title={title}
          description={description}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          showCharacterCount
        />
        <button id="submit" type="submit" className="btn btn-success">
          Submit
        </button>
      </form>
    </div>
  );
};
export default AddNote;
