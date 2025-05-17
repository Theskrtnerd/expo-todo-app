import Icon from 'react-native-vector-icons/FontAwesome';
import React, { useState } from 'react';
import { Keyboard, Pressable, ScrollView, Text, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NoteItem from './components/NoteItem';


interface Note {
  id: string;
  title: string;
  content?: string;
  isChecked: boolean;
  isEditing?: boolean;
}

export default function HomeScreen() {
  // State variables

  // Edit ID: the ID of the note that is currently being edited
  const [editId, setEditId] = useState<string | null>(null);

  // Notes: the list of notes
  const [notes, setNotes] = useState<Note[]>([]);

  // Has Notes: whether there are any notes
  const hasNotes = notes.length > 0;

  // Handle when the user clicks outside the note item
  // We run the handleBlur function to save the note
  const handleTapOutside = () => {
    if (editId) {
      const currentNote = notes.find((note) => note.id === editId);
      if (currentNote) {
        handleBlur(currentNote.id, currentNote.title, currentNote.content);
      }
    }
    Keyboard.dismiss();
  };

  // Set the note in edit mode
  const handleEdit = (id: string, title: string) => {
    if (title === "Enter title...") {
      setNotes(notes.map(note => 
        note.id === id ? { ...note, title: "" } : note
      ));
    }
    setEditId(id);
  };

  // Sort the notes by the checkmark
  const sortNotes = (notesToSort: Note[]): Note[] => {
    return [...notesToSort].sort((a, b) => {
      if (a.isChecked === b.isChecked) return 0;
      return a.isChecked ? 1 : -1;
    });
  };

  // Handle when the user toggles the checkmark of the note
  const toggleNoteCheck = (id: string) => {    
    const updatedNotes = notes.map(note => 
      note.id === id ? { ...note, isChecked: !note.isChecked } : note
    );
    setNotes(sortNotes(updatedNotes));
  };

  // Handle when the user adds a new note
  const addNewNote = () => {

    let existingDraft = false;

    // If the user is editing a note and the note is empty, we keep the draft
    if (editId) {
      const currentNote = notes.find((note) => note.id === editId);
      if (currentNote && currentNote.title === "" && currentNote.content === "") {
        existingDraft = true;
      }
    }

    // If there is no existing draft, we create a new note
    if (!existingDraft) {
      const newId = String(Date.now());
      const newNote: Note = {
        id: newId,
        title: '',
        content: '',
        isChecked: false
      };
      setNotes(prevNotes => [newNote, ...prevNotes]);
      setEditId(newId);
    }
  };

  // Handle when the user changes the title of the note
  const handleTitleChange = (id: string, newTitle: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, title: newTitle } : note
    ));
  };

  // Handle when the user changes the description of the note
  const handleContentChange = (id: string, newContent: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, content: newContent } : note
    ));
  };
  
  // Handle after the user has finished editing the note
  // We save the note if the user has entered a title or content
  // Otherwise, we delete the note
  const handleBlur = (id: string, title: string, content?: string) => {
    if ((title === "" || title === undefined) && (content === "" || content === undefined)) {
      setNotes(notes.filter(note => note.id !== id));
    } else {
      const titleText = title === "" || title === undefined ? "Enter title..." : title;
      setNotes(notes.map(note => 
        note.id === id ? { ...note, title: titleText, content: content } : note
      ));
    }
    setEditId(null);
  };

  return (
    <TouchableWithoutFeedback onPress={handleTapOutside}>
      <SafeAreaView className="flex-1">
        <View className="shadow-lg rounded-lg w-full lg:h-[80%] h-full bg-white max-w-3xl mx-auto my-auto relative">
          <View className="p-4 h-full">
            <Text className="text-start text-2xl font-bold mb-4">My Notes</Text>

            {/* Notes List */}
            {hasNotes ? (
              <ScrollView className="flex-1">
              {notes.map(note => (
                <NoteItem 
                  key={note.id}
                  id={note.id}
                  title={note.title} 
                  content={note.content}
                  isChecked={note.isChecked}
                  onToggleCheck={toggleNoteCheck}
                  onEdit={handleEdit}
                  onTitleChange={handleTitleChange}
                  onContentChange={handleContentChange}
                  onBlur={handleBlur}
                  editId={editId}
                />
                ))}
              </ScrollView>
            ): (
              <View className="flex-1 items-center justify-center">
                <Text className="text-gray-500">No notes yet</Text>
              </View>
            )}
          </View>

          {/* Add Note Button */}
          <Pressable 
            onPress={addNewNote} 
            className="flex flex-row w-full hover:bg-gray-200 absolute bottom-0 bg-gray-100 flex justify-center items-center py-3"
          >
            <Icon name="plus-circle" size={24} color="#3B82F6" />
            <Text className="text-blue-500 font-bold text-lg ml-2">
              Add Note
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}