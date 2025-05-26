import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal } from 'react-native';
import { Category, TransactionType } from '../types';
import { getCategories } from '../utils/database';
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';
import FontConfig from '../constants/FontConfig';
import { 
  ShoppingBag, 
  Briefcase, 
  CreditCard, 
  PlusCircle,
  Package, 
  Home, 
  Users, 
  Truck, 
  Zap, 
  MinusCircle,
  X
} from 'lucide-react-native';

interface CategorySelectorProps {
  type: TransactionType;
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const getCategoryIcon = (iconName: string, color: string = Colors.primary[500]) => {
  const size = Layout.sizes.iconMedium;
  
  switch (iconName) {
    case 'shopping-bag':
      return <ShoppingBag size={size} color={color} />;
    case 'briefcase':
      return <Briefcase size={size} color={color} />;
    case 'credit-card':
      return <CreditCard size={size} color={color} />;
    case 'plus-circle':
      return <PlusCircle size={size} color={color} />;
    case 'package':
      return <Package size={size} color={color} />;
    case 'home':
      return <Home size={size} color={color} />;
    case 'users':
      return <Users size={size} color={color} />;
    case 'truck':
      return <Truck size={size} color={color} />;
    case 'zap':
      return <Zap size={size} color={color} />;
    case 'minus-circle':
      return <MinusCircle size={size} color={color} />;
    default:
      return type === TransactionType.INCOME 
        ? <PlusCircle size={size} color={color} />
        : <MinusCircle size={size} color={color} />;
  }
};

const CategorySelector: React.FC<CategorySelectorProps> = ({
  type,
  selectedCategory,
  onSelectCategory,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategoryObj, setSelectedCategoryObj] = useState<Category | null>(null);
  
  useEffect(() => {
    loadCategories();
  }, [type]);
  
  useEffect(() => {
    if (categories.length > 0 && selectedCategory) {
      setSelectedCategoryObj(categories.find(c => c.id === selectedCategory) || null);
    }
  }, [categories, selectedCategory]);
  
  const loadCategories = async () => {
    try {
      const loadedCategories = await getCategories(type);
      setCategories(loadedCategories);
      
      // Set default selected category if none is selected
      if (!selectedCategory && loadedCategories.length > 0) {
        onSelectCategory(loadedCategories[0].id);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };
  
  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity 
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.selectedCategoryItem
      ]}
      onPress={() => {
        onSelectCategory(item.id);
        setModalVisible(false);
      }}
    >
      <View style={[styles.categoryIcon, { backgroundColor: item.color + '20' }]}>
        {getCategoryIcon(item.icon, item.color)}
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Category</Text>
      
      <TouchableOpacity 
        style={styles.selector}
        onPress={() => setModalVisible(true)}
      >
        {selectedCategoryObj ? (
          <View style={styles.selectedCategory}>
            <View style={[styles.categoryIcon, { backgroundColor: selectedCategoryObj.color + '20' }]}>
              {getCategoryIcon(selectedCategoryObj.icon, selectedCategoryObj.color)}
            </View>
            <Text style={styles.selectedCategoryText}>{selectedCategoryObj.name}</Text>
          </View>
        ) : (
          <Text style={styles.placeholderText}>Select a category</Text>
        )}
      </TouchableOpacity>
      
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <X size={24} color={Colors.gray[700]} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.categoryList}
              numColumns={2}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.m,
  },
  label: {
    fontFamily: FontConfig.bodyMedium,
    fontSize: 16,
    color: Colors.gray[800],
    marginBottom: Layout.spacing.s,
  },
  selector: {
    height: Layout.sizes.inputHeight,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: Layout.borderRadius.m,
    paddingHorizontal: Layout.spacing.m,
    justifyContent: 'center',
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: Layout.borderRadius.s,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.m,
  },
  selectedCategoryText: {
    fontFamily: FontConfig.body,
    fontSize: 16,
    color: Colors.gray[900],
  },
  placeholderText: {
    fontFamily: FontConfig.body,
    fontSize: 16,
    color: Colors.gray[500],
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Layout.borderRadius.l,
    borderTopRightRadius: Layout.borderRadius.l,
    padding: Layout.spacing.l,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.l,
  },
  modalTitle: {
    fontFamily: FontConfig.heading,
    fontSize: 20,
    color: Colors.gray[900],
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Layout.borderRadius.circle,
    backgroundColor: Colors.gray[100],
  },
  categoryList: {
    paddingBottom: Layout.spacing.xl,
  },
  categoryItem: {
    width: '48%',
    margin: '1%',
    padding: Layout.spacing.m,
    backgroundColor: Colors.gray[100],
    borderRadius: Layout.borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCategoryItem: {
    backgroundColor: Colors.primary[100],
    borderWidth: 2,
    borderColor: Colors.primary[500],
  },
  categoryName: {
    fontFamily: FontConfig.bodyMedium,
    fontSize: 14,
    color: Colors.gray[800],
    marginTop: Layout.spacing.s,
    textAlign: 'center',
  },
});

export default CategorySelector;