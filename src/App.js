import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopNav from './components/TopNav';
import AddNote from './components/AddNote';
import ListNotes from './components/ListNotes';
import EditNote from './components/EditNote';
import ViewNote from './components/ViewNote';

function App() {
  return (
     <Router>
       <div className="App">
         <TopNav />

         <Routes>
           <Route path="/" element={<ListNotes/>}/>
           <Route path="edit/:id" element={<EditNote/>}/>
           <Route path="/add" element={<AddNote/>}/>
           <Route path="view/:id" element={<ViewNote/>}/>
         </Routes>

       </div>
     </Router>
  );
}

export default App;
