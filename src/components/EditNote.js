import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import axios from "axios";

const EditNote=()=>{
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const navigate = useNavigate();
	const {id} = useParams();


	useEffect(() => {
		fetchNote()
	}, []);

	const fetchNote = async () => {
		try {
			const response = await axios.get('http://localhost:3004/notes/'+ id);
			setDescription(response.data.description);
			setTitle(response.data.title);
		} catch (error) {
			console.error('Error getting note: ', error);
		}
	}

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const response = await axios.put('http://localhost:3004/notes/'+id, {title, description})

			navigate('/');
		} catch (e) {
			console.error('Error editing note: ', e);
		}
	}

	return (
		<div className={'container'}>
			<h2>Edit Note</h2>
			<form onSubmit={handleSubmit}>
				<label>Title:</label>
				<input id={"notetitle"} type="text" value={title} aria-required={"true"} onChange={(e) => setTitle(e.target.value)} required className={'form-control'}/>
				<br/>
				<label>Note Text:</label>
				<textarea id={"notetext"} rows={"10"} value={description} onChange={(e) => setDescription(e.target.value)} required className={'form-control'}/>
				<br/>
				<button id='submitEdit' type={'submit'} className={'btn btn-success'}>Submit</button>
			</form>
		</div>
	)
}

export default EditNote;
