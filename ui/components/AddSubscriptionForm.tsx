import { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";

interface Subscription {
  _id?: string;
  name: string;
  amount: number;
  category: string;
  billing_cycle: string;
  next_due_date: string;
  vendor_website?: string;
  notes?: string;
}

interface AddSubscriptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Subscription) => void;
  editingSubscription?: Subscription | null;
  onSuccess?: () => void;
}

const AddSubscriptionForm = ({
  isOpen,
  onClose,
  onSubmit,
  editingSubscription,
  onSuccess
}: AddSubscriptionFormProps) => {
  const [formData, setFormData] = useState<Subscription>({
    name: "",
    amount: 0,
    category: "entertainment",
    billing_cycle: "monthly",
    next_due_date: "",
    vendor_website: "",
    notes: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingSubscription) {
      setFormData({
        ...editingSubscription,
        next_due_date: editingSubscription.next_due_date.split('T')[0] // Format for input[type="date"]
      });
    } else {
      setFormData({
        name: "",
        amount: 0,
        category: "entertainment",
        billing_cycle: "monthly",
        next_due_date: "",
        vendor_website: "",
        notes: ""
      });
    }
    setErrors({});
  }, [editingSubscription, isOpen]);

  const categories = [
    { value: "entertainment", label: "Entertainment" },
    { value: "music", label: "Music" },
    { value: "productivity", label: "Productivity" },
    { value: "development", label: "Development" },
    { value: "storage", label: "Storage" },
    { value: "fitness", label: "Fitness" },
    { value: "education", label: "Education" },
    { value: "news", label: "News" },
    { value: "business", label: "Business" },
    { value: "other", label: "Other" }
  ];

  const billingCycles = [
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "yearly", label: "Yearly" }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Service name is required";
    }

    if (formData.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.next_due_date) {
      newErrors.next_due_date = "Next due date is required";
    }

    if (formData.vendor_website && formData.vendor_website.trim()) {
      try {
        new URL(formData.vendor_website);
      } catch {
        newErrors.vendor_website = "Please enter a valid URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (editingSubscription) {
        // Update existing subscription
        await axios.put(
          `http://localhost:1337/api/subscriptions/${editingSubscription._id}`,
          formData,
          { withCredentials: true }
        );
      } else {
        // Create new subscription
        await axios.post(
          'http://localhost:1337/api/subscriptions',
          formData,
          { withCredentials: true }
        );
      }

      onSubmit(formData);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error: any) {
      console.error('Error saving subscription:', error);
      if (error.response?.data) {
        setErrors({ submit: error.response.data });
      } else {
        setErrors({ submit: 'Failed to save subscription. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof Subscription, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div
        className="feature-card"
        style={{
          maxWidth: '32rem',
          width: '100%',
          margin: '1rem',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
            {editingSubscription ? 'Edit Subscription' : 'Add New Subscription'}
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Service Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Service Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Netflix, Spotify"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errors.name ? '1px solid #dc2626' : '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
              />
              {errors.name && (
                <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Amount and Category */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Amount * ($)
                </label>
                <input
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                  placeholder="9.99"
                  step="0.01"
                  min="0"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.amount ? '1px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                />
                {errors.amount && (
                  <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.amount}
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Billing Cycle and Due Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Billing Cycle *
                </label>
                <select
                  value={formData.billing_cycle}
                  onChange={(e) => handleInputChange('billing_cycle', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                >
                  {billingCycles.map(cycle => (
                    <option key={cycle.value} value={cycle.value}>{cycle.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Next Due Date *
                </label>
                <input
                  type="date"
                  value={formData.next_due_date}
                  onChange={(e) => handleInputChange('next_due_date', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.next_due_date ? '1px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                />
                {errors.next_due_date && (
                  <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.next_due_date}
                  </p>
                )}
              </div>
            </div>

            {/* Website */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Website (optional)
              </label>
              <input
                type="url"
                value={formData.vendor_website || ''}
                onChange={(e) => handleInputChange('vendor_website', e.target.value)}
                placeholder="https://netflix.com"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errors.vendor_website ? '1px solid #dc2626' : '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
              />
              {errors.vendor_website && (
                <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {errors.vendor_website}
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Notes (optional)
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional details about this subscription..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.5rem',
                color: '#dc2626',
                fontSize: '0.875rem'
              }}>
                {errors.submit}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ opacity: isSubmitting ? 0.6 : 1 }}
            >
              {isSubmitting ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff40',
                    borderTop: '2px solid #ffffff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: '8px',
                    display: 'inline-block'
                  }} />
                  {editingSubscription ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                editingSubscription ? 'Update Subscription' : 'Add Subscription'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubscriptionForm;