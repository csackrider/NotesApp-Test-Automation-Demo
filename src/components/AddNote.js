import {useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";

const AddNote = () => {

	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const response = await axios.post('http://localhost:3004/notes', {title, description})

			navigate('/');
		} catch (e) {
			console.error('Error adding note: ', e);
		}
	}


	return (
		<div className={'container'}>
			<h2>Add Note</h2>
			<form onSubmit={handleSubmit}>
				<label>Title:</label>
				<input id={"notetitle"} type="text" aria-required={"true"} value={title} onChange={(e) => setTitle(e.target.value)} required className={'form-control'}/>
				<br/>
				<label>Note Text:</label>
				<textarea id={"notetext"} rows={"10"} value={description} onChange={(e) => setDescription(e.target.value)} required className={'form-control'}/>
				<br/>
				<button id='submit' type={'submit'} className={'btn btn-success'}>Submit</button>
			</form>
		</div>
	)
}
export default AddNote;
