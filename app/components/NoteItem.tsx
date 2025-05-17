import { Check, Trash2 } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Alert, Platform, Pressable, TextInput, View } from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    interpolateColor,
    Layout,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';


interface NoteItemProps {
  id: string;
  title: string;
  content?: string;
  isChecked: boolean;
  onToggleCheck: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onTitleChange: (id: string, newTitle: string) => void;
  onContentChange: (id: string, newContent: string) => void;
  onBlur: (id: string, title: string, content?: string) => void;
  editId: string | null;
}

export default function NoteItem({ 
  id, 
  title, 
  content, 
  isChecked, 
  onToggleCheck,
  onTitleChange,
  onContentChange,
  onBlur,
  onEdit,
  editId,
}: NoteItemProps) {

  // Title Input Ref: the ref of the title input
  const titleInputRef = useRef<TextInput>(null);

  // Is Editing: whether the note is currently being edited
  const isEditing = id === editId;
  
  // Animated values for checkbox
  const checkAnimatedValue = useSharedValue(isChecked ? 1 : 0);
  const checkScaleValue = useSharedValue(1);
  
  // Update animation value when isChecked changes
  useEffect(() => {
    checkAnimatedValue.value = withTiming(isChecked ? 1 : 0, { duration: 300 });
  }, [isChecked, checkAnimatedValue]);
  
  // Animated styles for checkbox container
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        checkAnimatedValue.value,
        [0, 1],
        ['transparent', '#3B82F6'], // From transparent to blue
        'RGB'
      ),
      borderColor: interpolateColor(
        checkAnimatedValue.value,
        [0, 1],
        ['#D1D5DB', '#3B82F6'], // From gray to blue
        'RGB'
      ),
      transform: [{ scale: checkScaleValue.value }],
    };
  });
  
  // Animated style for check mark
  const checkMarkAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: checkAnimatedValue.value,
      transform: [
        { scale: checkAnimatedValue.value },
        { translateY: withTiming(checkAnimatedValue.value * -1, { duration: 150 }) }
      ],
    };
  });

  // Handle press with tactile feedback
  const handleCheckPress = () => {
    // Provide tactile feedback with a quick scale animation
    checkScaleValue.value = withSpring(0.8, { damping: 8 }, () => {
      checkScaleValue.value = withSpring(1);
    });
    onToggleCheck(id);
  };

  // Focus the title input when the note is being edited
  useEffect(() => {
    if (isEditing) {
      const timeout = setTimeout(() => {
        titleInputRef.current?.focus();
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [isEditing]);

  return (
    // Animated View: the view of the note item, add animations when the note is added or removed, or rearranged
    <Animated.View entering={FadeIn} exiting={FadeOut} layout={Layout.springify()} className="mb-2 flex-row items-center">
        <Pressable
          onPress={handleCheckPress}
          hitSlop={10}
        >
          <Animated.View 
            className="mr-2 w-6 h-6 rounded-full items-center justify-center border"
            style={containerAnimatedStyle}
          >
            <Animated.View style={checkMarkAnimatedStyle}>
              <Check size={14} color="white" strokeWidth={3} />
            </Animated.View>
          </Animated.View>
        </Pressable>
      <Pressable 
        className="p-4 bg-white flex-col items-start flex-1 border-b border-gray-200"
        onPress={() => {
          if (!isChecked && id !== editId) {
            onEdit(id, title);
          }
        }}
      >
        <View style={{ pointerEvents: id === editId ? 'auto' : 'none' }} className="w-full">
            <TextInput
                ref={titleInputRef}
                key={`title-${id}`}
                value={title}
                onChangeText={(text) => onTitleChange(id, text)}
                className={`font-medium ${isChecked ? 'line-through text-gray-400' : ''}`}
                placeholder="Enter title..."
                editable={id === editId}
                selectTextOnFocus={id === editId}
            />
            {(content !== "" || isEditing) && (
                <TextInput
                    key={`content-${id}`}
                    value={content}
                    onChangeText={(text) => onContentChange(id, text)}
                    className={`text-gray-600 text-sm ${isChecked ? 'line-through text-gray-300' : ''}`}
                    placeholder="Add a description..."
                    editable={id === editId}
                />
            )}
        </View>
      </Pressable>
        <Pressable
          onPress={() => {
            // Alert isn't supported on web
            if (Platform.OS === 'web') {
              onBlur(id, "", "");
            } else {
              Alert.alert(
                  "Delete Note",
                  "Are you sure you want to delete this note?",
                  [
                    {
                      text: "Cancel",
                      style: "cancel"
                    },
                    {
                      text: "Delete",
                      onPress: () => onBlur(id, "", ""),
                      style: "destructive"
                    }
                  ]
                );
            }
          }}
          className="p-2 ml-2"
        >
          <Trash2 size={20} color="#EF4444" />
        </Pressable>
    </Animated.View>
  );
};